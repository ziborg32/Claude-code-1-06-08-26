// Коды берутся из переменной окружения PROMO_CODES (через запятую) и хранятся в памяти.
// При каждом перезапуске/передеплое список загружается заново из переменной —
// поэтому уже выданные коды нужно самостоятельно убирать из PROMO_CODES,
// иначе после рестарта один и тот же код может быть выдан повторно.
// Для настоящего продакшена коды и факт выдачи должны храниться во внешней БД.
let codes = (process.env.PROMO_CODES || '')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

function takeCode() {
  return codes.shift();
}

function remainingCount() {
  return codes.length;
}

module.exports = { takeCode, remainingCount };
