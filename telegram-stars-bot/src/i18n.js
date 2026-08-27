const LOCALES = {
  ru: {
    offer: (period, price) =>
      `Промокод на подписку журнала «Хакер» (${period}) ⭐️\n\nЦена: ${price} Stars`,
    buyButton: 'GET LINK!',
    invoiceTitle: (period) => `Промокод: журнал «Хакер» (${period})`,
    invoiceDescription: (period) => `Промокод для активации подписки на журнал «Хакер» (${period})`,
    payLabel: (period) => `Промокод «Хакер» (${period})`,
    productUnavailable: 'Товар недоступен, оплата отменена',
    soldOut: 'Промокоды закончились. Попробуйте позже или напишите в поддержку.',
    thanks: (code, period) =>
      `Спасибо за покупку! ⭐️\n\nВаш промокод на подписку журнала «Хакер» (${period}):\n\n${code}\n\nАктивируйте его в личном кабинете на сайте журнала.`,
  },
  en: {
    offer: (period, price) =>
      `Subscription promo code for «Hacker» magazine (${period}) ⭐️\n\nPrice: ${price} Stars`,
    buyButton: 'GET LINK!',
    invoiceTitle: (period) => `Promo code: Hacker magazine (${period})`,
    invoiceDescription: (period) => `Activation promo code for a Hacker magazine subscription (${period})`,
    payLabel: (period) => `Hacker magazine promo (${period})`,
    productUnavailable: 'Product unavailable, payment cancelled',
    soldOut: 'Promo codes are sold out. Please try again later or contact support.',
    thanks: (code, period) =>
      `Thanks for your purchase! ⭐️\n\nYour Hacker magazine subscription promo code (${period}):\n\n${code}\n\nActivate it in your account on the magazine's website.`,
  },
};

function isRussian(languageCode) {
  return Boolean(languageCode && languageCode.toLowerCase().startsWith('ru'));
}

function getLocale(languageCode) {
  return isRussian(languageCode) ? LOCALES.ru : LOCALES.en;
}

// Текст срока подписки настраивается через Variables на Railway
// (SUBSCRIPTION_PERIOD_RU / SUBSCRIPTION_PERIOD_EN), без изменения кода.
function getPeriod(languageCode) {
  return isRussian(languageCode)
    ? process.env.SUBSCRIPTION_PERIOD_RU || '12 месяцев'
    : process.env.SUBSCRIPTION_PERIOD_EN || '12 months';
}

module.exports = { getLocale, getPeriod };
