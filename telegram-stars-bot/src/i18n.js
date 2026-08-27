const LOCALES = {
  ru: {
    offer: (productName, period, price) =>
      `Промокод на подписку на ${productName} (${period}) ⭐️\n\nЦена: ${price} Stars`,
    buyButton: 'GET LINK!',
    invoiceTitle: (productName, period) => `Промокод: ${productName} (${period})`,
    invoiceDescription: (productName, period) =>
      `Промокод для активации подписки на ${productName} (${period})`,
    payLabel: (productName, period) => `Промокод: ${productName} (${period})`,
    productUnavailable: 'Товар недоступен, оплата отменена',
    soldOut: 'Промокоды закончились. Попробуйте позже или напишите в поддержку.',
    thanks: (code, productName, period) =>
      `Спасибо за покупку! ⭐️\n\nВаш промокод на подписку на ${productName} (${period}):\n\n${code}\n\nАктивируйте его в личном кабинете на сайте.`,
  },
  en: {
    offer: (productName, period, price) =>
      `Subscription promo code for ${productName} (${period}) ⭐️\n\nPrice: ${price} Stars`,
    buyButton: 'GET LINK!',
    invoiceTitle: (productName, period) => `Promo code: ${productName} (${period})`,
    invoiceDescription: (productName, period) =>
      `Activation promo code for a ${productName} subscription (${period})`,
    payLabel: (productName, period) => `Promo code: ${productName} (${period})`,
    productUnavailable: 'Product unavailable, payment cancelled',
    soldOut: 'Promo codes are sold out. Please try again later or contact support.',
    thanks: (code, productName, period) =>
      `Thanks for your purchase! ⭐️\n\nYour ${productName} subscription promo code (${period}):\n\n${code}\n\nActivate it in your account on the website.`,
  },
};

function isRussian(languageCode) {
  return Boolean(languageCode && languageCode.toLowerCase().startsWith('ru'));
}

function getLocale(languageCode) {
  return isRussian(languageCode) ? LOCALES.ru : LOCALES.en;
}

// Срок подписки и название товара настраиваются через Variables на Railway —
// SUBSCRIPTION_PERIOD_RU/EN и PRODUCT_NAME_RU/EN — без изменения кода.
function getPeriod(languageCode) {
  return isRussian(languageCode)
    ? process.env.SUBSCRIPTION_PERIOD_RU || '12 месяцев'
    : process.env.SUBSCRIPTION_PERIOD_EN || '12 months';
}

function getProductName(languageCode) {
  return isRussian(languageCode)
    ? process.env.PRODUCT_NAME_RU || 'журнал «Хакер»'
    : process.env.PRODUCT_NAME_EN || '«Hacker» magazine';
}

module.exports = { getLocale, getPeriod, getProductName };
