const { json } = require("./_lib/response");
const { defaultOwner } = require("./_lib/supabase");
const { freebusy } = require("./_lib/google");

function fallbackSlots() {
  const slots = [];
  const now = new Date();
  now.setHours(now.getHours() + 2, 0, 0, 0);
  for (let day = 0; day < 7; day += 1) {
    for (const hour of [10, 13, 15, 17]) {
      const start = new Date(now);
      start.setDate(now.getDate() + day);
      start.setHours(hour, 0, 0, 0);
      if (start <= new Date()) continue;
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      slots.push({ start: start.toISOString(), end: end.toISOString() });
    }
  }
  return slots.slice(0, 12);
}

function overlaps(slot, busy) {
  const s = new Date(slot.start).getTime();
  const e = new Date(slot.end).getTime();
  return busy.some((item) => s < new Date(item.end).getTime() && e > new Date(item.start).getTime());
}

exports.handler = async () => {
  try {
    const owner = await defaultOwner();
    const slots = fallbackSlots();
    if (!owner) return json(200, { slots });
    const timeMin = slots[0].start;
    const timeMax = slots[slots.length - 1].end;
    const busy = await freebusy(owner.id, timeMin, timeMax).catch(() => []);
    return json(200, { slots: slots.filter((slot) => !overlaps(slot, busy)) });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
