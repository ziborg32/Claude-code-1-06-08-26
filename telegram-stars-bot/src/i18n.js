// Все тексты ниже можно полностью переопределить через Variables на Railway,
// без изменения кода. Плейсхолдеры в тексте: {product} {period} {price} {code}
// (не все плейсхолдеры доступны везде — см. таблицу переменных в README).
const DEFAULTS = {
  ru: {
    offer: 'Промокод на подписку на {product} ({period}) ⭐️\n\nЦена: {price} Stars',
    buyButton: 'GET LINK!',
    invoiceTitle: 'Промокод: {product} ({period})',
    invoiceDescription: 'Промокод для активации подписки на {product} ({period})',
    payLabel: 'Промокод: {product} ({period})',
    productUnavailable: 'Товар недоступен, оплата отменена',
    soldOut: 'Промокоды закончились. Попробуйте позже или напишите в поддержку.',
    thanks:
      'Спасибо за покупку! ⭐️\n\nВаш промокод на подписку на {product} ({period}):\n\n{code}\n\nАктивируйте его в личном кабинете на сайте.',
  },
  en: {
    offer: 'Subscription promo code for {product} ({period}) ⭐️\n\nPrice: {price} Stars',
    buyButton: 'GET LINK!',
    invoiceTitle: 'Promo code: {product} ({period})',
    invoiceDescription: 'Activation promo code for a {product} subscription ({period})',
    payLabel: 'Promo code: {product} ({period})',
    productUnavailable: 'Product unavailable, payment cancelled',
    soldOut: 'Promo codes are sold out. Please try again later or contact support.',
    thanks:
      "Thanks for your purchase! ⭐️\n\nYour {product} subscription promo code ({period}):\n\n{code}\n\nActivate it in your account on the website.",
  },
};

// Соответствие поля тексту env-переменной (без суффикса _RU/_EN).
const ENV_KEYS = {
  offer: 'OFFER_TEXT',
  buyButton: 'BUY_BUTTON',
  invoiceTitle: 'INVOICE_TITLE',
  invoiceDescription: 'INVOICE_DESCRIPTION',
  payLabel: 'PAY_LABEL',
  soldOut: 'SOLD_OUT_TEXT',
  thanks: 'THANKS_TEXT',
};

function isRussian(languageCode) {
  return Boolean(languageCode && languageCode.toLowerCase().startsWith('ru'));
}

function pickLang(languageCode) {
  return isRussian(languageCode) ? 'ru' : 'en';
}

function render(template, vars) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

function getTemplate(field, languageCode) {
  const lang = pickLang(languageCode);
  const envKey = ENV_KEYS[field];
  const envVar = envKey && process.env[`${envKey}_${lang.toUpperCase()}`];
  return envVar || DEFAULTS[lang][field];
}

function getLocale(languageCode) {
  return {
    buyButton: getTemplate('buyButton', languageCode),
    productUnavailable: DEFAULTS[pickLang(languageCode)].productUnavailable,
    soldOut: getTemplate('soldOut', languageCode),
    offer: (vars) => render(getTemplate('offer', languageCode), vars),
    invoiceTitle: (vars) => render(getTemplate('invoiceTitle', languageCode), vars),
    invoiceDescription: (vars) => render(getTemplate('invoiceDescription', languageCode), vars),
    payLabel: (vars) => render(getTemplate('payLabel', languageCode), vars),
    thanks: (vars) => render(getTemplate('thanks', languageCode), vars),
  };
}

// Срок подписки и название товара — тоже через Variables на Railway:
// SUBSCRIPTION_PERIOD_RU/EN и PRODUCT_NAME_RU/EN.
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
