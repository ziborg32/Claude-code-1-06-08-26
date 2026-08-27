const http = require('http');
const { isValidWebhookSignature } = require('./cryptomus');
const { pendingOrders } = require('./pendingOrders');
const { getLocale, getPeriod, getProductName } = require('./i18n');
const { takeCode, remainingCount } = require('./promoCodes');

// Статусы Cryptomus, которые считаем успешной оплатой.
const PAID_STATUSES = new Set(['paid', 'paid_over']);

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function handleCryptomusWebhook(bot, body) {
  if (!isValidWebhookSignature(body)) {
    console.error('Cryptomus webhook: неверная подпись, запрос проигнорирован');
    return;
  }

  const orderId = body.order_id;
  const order = pendingOrders.get(orderId);
  if (!order) {
    // Уже обработан раньше (Cryptomus повторяет вебхук) или заказ неизвестен.
    return;
  }

  if (!PAID_STATUSES.has(body.status)) {
    console.log('Cryptomus webhook: статус пока не оплачен', { orderId, status: body.status });
    return;
  }

  pendingOrders.delete(orderId);

  const code = takeCode();
  console.log('Cryptomus: успешная оплата', {
    orderId,
    chatId: order.chatId,
    codeIssued: Boolean(code),
    codesLeft: remainingCount(),
  });

  const t = getLocale(order.languageCode);
  if (!code) {
    console.error('ВНИМАНИЕ: промокоды закончились, но оплата через Cryptomus прошла. orderId:', orderId);
    await bot.telegram.sendMessage(order.chatId, t.soldOut);
    return;
  }

  const vars = {
    product: getProductName(order.languageCode),
    period: getPeriod(order.languageCode),
    code,
  };
  await bot.telegram.sendMessage(order.chatId, t.thanks(vars));
}

function startWebhookServer(bot) {
  const port = process.env.PORT || 3000;

  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/cryptomus/webhook') {
      try {
        const body = await readJsonBody(req);
        await handleCryptomusWebhook(bot, body);
      } catch (err) {
        console.error('Ошибка обработки вебхука Cryptomus:', err);
      }
      res.writeHead(200);
      res.end('ok');
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(port, () => {
    console.log(`HTTP-сервер для вебхука Cryptomus слушает порт ${port}`);
  });

  return server;
}

module.exports = { startWebhookServer };
