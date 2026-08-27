const crypto = require('crypto');

const API_URL = 'https://api.cryptomus.com/v1/payment';

function sign(payload) {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json, 'utf8').toString('base64');
  return crypto.createHash('md5').update(base64 + process.env.CRYPTOMUS_API_KEY).digest('hex');
}

// Создаёт счёт на оплату (карта или крипта — выбор способа Cryptomus показывает
// сам на своей странице оплаты) и возвращает ссылку, куда отправить покупателя.
async function createInvoice({ orderId, amountUsd, callbackUrl }) {
  const payload = {
    amount: String(amountUsd),
    currency: 'USD',
    order_id: orderId,
    url_callback: callbackUrl,
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      merchant: process.env.CRYPTOMUS_MERCHANT_ID,
      sign: sign(payload),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.result || !data.result.url) {
    throw new Error(`Cryptomus createInvoice failed: ${JSON.stringify(data)}`);
  }
  return data.result.url;
}

// Проверяет, что вебхук действительно прислал Cryptomus, а не кто-то посторонний.
// Подпись считается по тем же правилам, что и при создании счёта, но без поля sign.
function isValidWebhookSignature(body) {
  const { sign: receivedSign, ...rest } = body;
  if (!receivedSign) return false;
  return sign(rest) === receivedSign;
}

module.exports = { createInvoice, isValidWebhookSignature };
