// Один многоразовый промокод из переменной окружения PROMO_CODE.
// Выдаётся всем покупателям одинаковый — если понадобятся уникальные
// одноразовые коды на каждого покупателя, нужна другая схема (список + БД).
const CODE = process.env.PROMO_CODE || '';

function takeCode() {
  return CODE || undefined;
}

function remainingCount() {
  return CODE ? Infinity : 0;
}

module.exports = { takeCode, remainingCount };
