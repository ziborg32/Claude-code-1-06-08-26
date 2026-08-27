const LOCALES = {
  ru: {
    offer:
      'Промокод на годовую подписку журнала «Хакер» ⭐️\n\nЦена: 2500 Stars',
    buyButton: 'GET LINK!',
    invoiceTitle: 'Промокод: журнал «Хакер», 12 месяцев',
    invoiceDescription: 'Промокод для активации годовой подписки на журнал «Хакер»',
    payLabel: 'Промокод «Хакер» (12 мес.)',
    productUnavailable: 'Товар недоступен, оплата отменена',
    soldOut: 'Промокоды закончились. Попробуйте позже или напишите в поддержку.',
    thanks: (code) =>
      `Спасибо за покупку! ⭐️\n\nВаш промокод на годовую подписку журнала «Хакер»:\n\n${code}\n\nАктивируйте его в личном кабинете на сайте журнала.`,
  },
  en: {
    offer: 'Yearly subscription promo code for «Hacker» magazine ⭐️\n\nPrice: 2500 Stars',
    buyButton: 'GET LINK!',
    invoiceTitle: 'Promo code: Hacker magazine, 12 months',
    invoiceDescription: 'Activation promo code for a yearly Hacker magazine subscription',
    payLabel: 'Hacker magazine promo (12 mo.)',
    productUnavailable: 'Product unavailable, payment cancelled',
    soldOut: 'Promo codes are sold out. Please try again later or contact support.',
    thanks: (code) =>
      `Thanks for your purchase! ⭐️\n\nYour Hacker magazine yearly subscription promo code:\n\n${code}\n\nActivate it in your account on the magazine's website.`,
  },
};

function getLocale(languageCode) {
  if (languageCode && languageCode.toLowerCase().startsWith('ru')) {
    return LOCALES.ru;
  }
  return LOCALES.en;
}

module.exports = { getLocale };
