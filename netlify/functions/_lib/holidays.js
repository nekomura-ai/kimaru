// 日本の祝日を「計算」で判定する（祝日法ベース・現行制度）。外部通信なし／毎年更新不要。
// 対応: 固定日・ハッピーマンデー・春分/秋分（近似式 1980-2099）・振替休日・国民の休日。
// 注意: 五輪特例のような一度きりの祝日移動は法改正のため計算では反映できない。

function pad2(n) {
  return String(n).padStart(2, "0");
}

function keyOf(dateObj) {
  return `${dateObj.getUTCFullYear()}-${pad2(dateObj.getUTCMonth() + 1)}-${pad2(dateObj.getUTCDate())}`;
}

// 指定月の第n月曜の「日」。month1 は 1-12。
function nthMonday(year, month1, nth) {
  const firstDow = new Date(Date.UTC(year, month1 - 1, 1)).getUTCDay(); // 0=日
  const firstMonday = 1 + ((8 - firstDow) % 7);
  return firstMonday + (nth - 1) * 7;
}

// 春分の日（近似式・1980-2099で有効）
function vernalEquinox(year) {
  return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

// 秋分の日（近似式・1980-2099で有効）
function autumnalEquinox(year) {
  return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

const ONE_DAY = 24 * 60 * 60 * 1000;
const cache = new Map();

function computeYear(year) {
  // 1) 法定祝日（振替前）
  const base = [
    [1, 1],
    [1, nthMonday(year, 1, 2)], // 成人の日
    [2, 11],
  ];
  if (year >= 2020) base.push([2, 23]); // 天皇誕生日
  base.push([3, vernalEquinox(year)]); // 春分の日
  base.push([4, 29]); // 昭和の日
  base.push([5, 3]);
  base.push([5, 4]); // みどりの日
  base.push([5, 5]);
  base.push([7, nthMonday(year, 7, 3)]); // 海の日
  if (year >= 2016) base.push([8, 11]); // 山の日
  base.push([9, nthMonday(year, 9, 3)]); // 敬老の日
  base.push([9, autumnalEquinox(year)]); // 秋分の日
  base.push([10, nthMonday(year, 10, 2)]); // スポーツの日
  base.push([11, 3]); // 文化の日
  base.push([11, 23]); // 勤労感謝の日

  const set = new Set();
  const objs = base.map(([m, d]) => new Date(Date.UTC(year, m - 1, d)));
  objs.forEach((o) => set.add(keyOf(o)));

  // 2) 国民の休日: 前日・翌日がともに祝日で、その日自身が祝日でも日曜でもない平日
  objs.forEach((o) => {
    const mid = new Date(o.getTime() + ONE_DAY);
    const next = new Date(o.getTime() + 2 * ONE_DAY);
    if (set.has(keyOf(next)) && !set.has(keyOf(mid)) && mid.getUTCDay() !== 0) {
      set.add(keyOf(mid));
    }
  });

  // 3) 振替休日: 祝日（国民の休日含む）が日曜なら、その後の最初の非祝日を休みに
  [...set].forEach((k) => {
    const [y, m, d] = k.split("-").map(Number);
    const o = new Date(Date.UTC(y, m - 1, d));
    if (o.getUTCDay() === 0) {
      let cand = new Date(o.getTime() + ONE_DAY);
      while (set.has(keyOf(cand))) cand = new Date(cand.getTime() + ONE_DAY);
      set.add(keyOf(cand));
    }
  });

  return set;
}

// year, month0（0始まり）, date を受け取り、日本の祝日かを判定。
function isJapaneseHoliday(year, month0, date) {
  if (!cache.has(year)) cache.set(year, computeYear(year));
  return cache.get(year).has(`${year}-${pad2(month0 + 1)}-${pad2(date)}`);
}

module.exports = { isJapaneseHoliday };
