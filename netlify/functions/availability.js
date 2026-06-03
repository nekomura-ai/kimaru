const { json } = require("./_lib/response");
const { defaultOwner, findOwnerById, sb, eq } = require("./_lib/supabase");
const { freebusy } = require("./_lib/google");

const DEFAULT_WEEKLY_AVAILABILITY = [1, 2, 3, 4, 5].map((day) => ({ day_of_week: day, start_time: "10:00", end_time: "18:00" }));
const TOKYO_OFFSET_MINUTES = 9 * 60;

function timeToMinutes(time) {
  const [hours, minutes] = String(time).slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function tokyoParts(date) {
  const shifted = new Date(date.getTime() + TOKYO_OFFSET_MINUTES * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    date: shifted.getUTCDate(),
    day: shifted.getUTCDay(),
  };
}

function tokyoLocalDateToUtc(year, month, date, minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return new Date(Date.UTC(year, month, date, hours - 9, mins, 0, 0));
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function generateSlots(weeklySettings, bookingPage) {
  const settings = weeklySettings.length ? weeklySettings : DEFAULT_WEEKLY_AVAILABILITY;
  const byDay = new Map(settings.map((setting) => [Number(setting.day_of_week), setting]));
  const duration = Number(bookingPage?.duration_minutes || 30);
  const bufferBefore = Number(bookingPage?.buffer_before_minutes || 0);
  const bufferAfter = Number(bookingPage?.buffer_after_minutes || 0);
  const step = duration + bufferBefore + bufferAfter;
  const rangeMonths = Number(bookingPage?.booking_range_months || 1);
  const now = new Date();
  const until = addMonths(now, Math.min(Math.max(rangeMonths, 1), 6));
  const slots = [];

  for (let offset = 0; offset < 190 && slots.length < 80; offset += 1) {
    const base = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const parts = tokyoParts(base);
    const setting = byDay.get(parts.day);
    if (!setting) continue;

    const open = timeToMinutes(setting.start_time);
    const close = timeToMinutes(setting.end_time);
    for (let minute = open + bufferBefore; minute + duration + bufferAfter <= close; minute += step) {
      const start = tokyoLocalDateToUtc(parts.year, parts.month, parts.date, minute);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      if (start <= now || start > until) continue;
      slots.push({ start: start.toISOString(), end: end.toISOString() });
      if (slots.length >= 80) break;
    }
  }

  return slots.slice(0, 80);
}

function overlaps(slot, busy) {
  const s = new Date(slot.start).getTime();
  const e = new Date(slot.end).getTime();
  return busy.some((item) => s < new Date(item.end).getTime() && e > new Date(item.start).getTime());
}

async function ownerBookingPage(owner) {
  const rows = await sb(`booking_pages?owner_id=${eq(owner.id)}&slug=${eq(owner.slug || "demo")}&limit=1`);
  return rows[0] || null;
}

async function ownerAvailability(owner) {
  return sb(`availability_settings?owner_id=${eq(owner.id)}&order=day_of_week.asc,start_time.asc`);
}

async function bookingPageQuestions(bookingPage) {
  if (!bookingPage) return [];
  const rows = await sb(`questionnaire_questions?booking_page_id=${eq(bookingPage.id)}&order=sort_order.asc`).catch(() => []);
  return rows.map((row) => ({ id: row.id, question_text: row.question_text, is_required: Boolean(row.is_required) }));
}

exports.handler = async (event) => {
  try {
    // slug 指定があれば該当の予約ページ＋オーナーを解決（無ければ既定オーナーの先頭ページ）。
    const slug = String(event?.queryStringParameters?.slug || "").trim().toLowerCase();
    let owner = null;
    let bookingPage = null;
    if (slug && slug !== "demo") {
      const pages = await sb(`booking_pages?slug=${eq(slug)}&limit=1`).catch(() => []);
      bookingPage = pages[0] || null;
      if (bookingPage) owner = await findOwnerById(bookingPage.owner_id);
    }
    if (!owner) {
      owner = await defaultOwner();
      bookingPage = owner ? await ownerBookingPage(owner) : null;
    }
    if (!owner) return json(200, { slots: generateSlots(DEFAULT_WEEKLY_AVAILABILITY, null), questions: [] });

    const questions = await bookingPageQuestions(bookingPage);
    const weeklySettings = await ownerAvailability(owner).catch(() => []);
    const slots = generateSlots(weeklySettings, bookingPage);
    if (!slots.length) return json(200, { slots: [], questions });

    const timeMin = slots[0].start;
    const timeMax = slots[slots.length - 1].end;
    const busy = await freebusy(owner.id, timeMin, timeMax).catch(() => []);
    return json(200, { slots: slots.filter((slot) => !overlaps(slot, busy)), questions });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
