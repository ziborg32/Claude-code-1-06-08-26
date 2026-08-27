const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const { PRODUCT } = require('./products');
const { getLocale, getPeriod, getProductName } = require('./i18n');
const { takeCode, remainingCount } = require('./promoCodes');

// chargeId -> { userId, amount } — для демо-команды /refund.
// В проде вместо Map нужна настоящая БД, т.к. память бота обнуляется при рестарте.
const purchases = new Map();

function createBot(token) {
  const bot = new Telegraf(token);

  bot.start((ctx) => {
    const t = getLocale(ctx.from.language_code);
    const period = getPeriod(ctx.from.language_code);
    const productName = getProductName(ctx.from.language_code);
    ctx.reply(t.offer(productName, period, PRODUCT.priceStars), {
      reply_markup: {
        inline_keyboard: [[{ text: t.buyButton, callback_data: `buy:${PRODUCT.id}` }]],
      },
    });
  });

  bot.action(/^buy:(.+)$/, async (ctx) => {
    const t = getLocale(ctx.from.language_code);
    const period = getPeriod(ctx.from.language_code);
    const productName = getProductName(ctx.from.language_code);
    if (ctx.match[1] !== PRODUCT.id) {
      await ctx.answerCbQuery(t.productUnavailable);
      return;
    }
    await ctx.answerCbQuery();
    await ctx.sendInvoice({
      chat_id: ctx.chat.id,
      title: t.invoiceTitle(productName, period),
      description: t.invoiceDescription(productName, period),
      payload: `product:${PRODUCT.id}`,
      provider_token: '', // для Stars provider_token всегда пустая строка
      currency: 'XTR',
      prices: [{ label: t.payLabel(productName, period), amount: PRODUCT.priceStars }],
    });
  });

  // Telegram даёт 10 секунд на ответ, иначе платёж отменяется автоматически.
  bot.on('pre_checkout_query', async (ctx) => {
    const t = getLocale(ctx.from.language_code);
    const productId = ctx.preCheckoutQuery.invoice_payload.replace('product:', '');
    if (productId !== PRODUCT.id) {
      await ctx.answerPreCheckoutQuery(false, t.productUnavailable);
      return;
    }
    if (remainingCount() === 0) {
      await ctx.answerPreCheckoutQuery(false, t.soldOut);
      return;
    }
    await ctx.answerPreCheckoutQuery(true);
  });

  bot.on(message('successful_payment'), async (ctx) => {
    const t = getLocale(ctx.from.language_code);
    const period = getPeriod(ctx.from.language_code);
    const productName = getProductName(ctx.from.language_code);
    const payment = ctx.message.successful_payment;
    const code = takeCode();

    purchases.set(payment.telegram_payment_charge_id, {
      userId: ctx.from.id,
      amount: payment.total_amount,
    });

    console.log('Успешная оплата:', {
      user: ctx.from.id,
      stars: payment.total_amount,
      chargeId: payment.telegram_payment_charge_id,
      codeIssued: Boolean(code),
      codesLeft: remainingCount(),
    });

    if (!code) {
      // Деньги уже списаны, а выдать нечего — такое нельзя оставлять молча.
      console.error('ВНИМАНИЕ: промокоды закончились, но оплата прошла. chargeId:', payment.telegram_payment_charge_id);
      await ctx.reply(t.soldOut);
      return;
    }

    await ctx.reply(t.thanks(code, productName, period));
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
