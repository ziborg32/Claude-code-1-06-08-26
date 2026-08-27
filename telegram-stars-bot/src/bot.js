const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const { PRODUCTS } = require('./products');

// chargeId -> { userId, productId, amount } — для демо-команды /refund.
// В проде вместо Map нужна настоящая БД, т.к. память бота обнуляется при рестарте.
const purchases = new Map();

function buildCatalogKeyboard() {
  return {
    inline_keyboard: PRODUCTS.map((p) => [
      { text: `${p.title} — ${p.priceStars} ⭐️`, callback_data: `buy:${p.id}` },
    ]),
  };
}

function createBot(token) {
  const bot = new Telegraf(token);

  bot.start((ctx) => {
    ctx.reply(
      'Привет! Здесь можно купить товары за Telegram Stars ⭐️\n\nВыберите товар:',
      { reply_markup: buildCatalogKeyboard() }
    );
  });

  bot.command('shop', (ctx) => {
    ctx.reply('Каталог:', { reply_markup: buildCatalogKeyboard() });
  });

  bot.action(/^buy:(.+)$/, async (ctx) => {
    const product = PRODUCTS.find((p) => p.id === ctx.match[1]);
    if (!product) {
      await ctx.answerCbQuery('Товар не найден');
      return;
    }
    await ctx.answerCbQuery();
    await ctx.sendInvoice({
      chat_id: ctx.chat.id,
      title: product.title,
      description: product.description,
      payload: `product:${product.id}`,
      provider_token: '', // для Stars provider_token всегда пустая строка
      currency: 'XTR',
      prices: [{ label: product.title, amount: product.priceStars }],
    });
  });

  // Telegram даёт 10 секунд на ответ, иначе платёж отменяется автоматически.
  bot.on('pre_checkout_query', async (ctx) => {
    const productId = ctx.preCheckoutQuery.invoice_payload.replace('product:', '');
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      await ctx.answerPreCheckoutQuery(false, 'Товар недоступен, оплата отменена');
      return;
    }
    await ctx.answerPreCheckoutQuery(true);
  });

  bot.on(message('successful_payment'), async (ctx) => {
    const payment = ctx.message.successful_payment;
    const productId = payment.invoice_payload.replace('product:', '');
    const product = PRODUCTS.find((p) => p.id === productId);

    purchases.set(payment.telegram_payment_charge_id, {
      userId: ctx.from.id,
      productId,
      amount: payment.total_amount,
    });

    console.log('Успешная оплата:', {
      user: ctx.from.id,
      product: productId,
      stars: payment.total_amount,
      chargeId: payment.telegram_payment_charge_id,
    });

    await ctx.reply(
      `Спасибо за покупку «${product ? product.title : productId}»! ⭐️\n` +
        `Оплата на ${payment.total_amount} Stars прошла успешно.`
    );
  });

  // Демо-команда для владельца бота: /refund <telegram_payment_charge_id>
  // chargeId печатается в консоль (и хранится в purchases) при каждой успешной оплате.
  bot.command('refund', async (ctx) => {
    if (!process.env.ADMIN_ID || String(ctx.from.id) !== process.env.ADMIN_ID) {
      return;
    }
    const chargeId = ctx.message.text.split(' ')[1];
    const purchase = chargeId && purchases.get(chargeId);
    if (!purchase) {
      await ctx.reply('Использование: /refund <telegram_payment_charge_id>');
      return;
    }
    try {
      await ctx.telegram.refundStarPayment(purchase.userId, chargeId);
      purchases.delete(chargeId);
      await ctx.reply('Возврат выполнен успешно');
    } catch (err) {
      await ctx.reply(`Ошибка возврата: ${err.message}`);
    }
  });

  return bot;
}

module.exports = { createBot };
