// orderId -> { chatId, languageCode } — заказы, ожидающие оплаты через Cryptomus.
// В памяти, как и purchases/promoCodes — при перезапуске бота список теряется,
// для продакшена нужна БД.
const pendingOrders = new Map();

function createOrderId() {
  return `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = { pendingOrders, createOrderId };
