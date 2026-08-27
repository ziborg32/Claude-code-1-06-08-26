require('dotenv').config();
const { createBot } = require('./src/bot');
const { startWebhookServer } = require('./src/webhookServer');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN не задан. Скопируйте .env.example в .env и укажите токен от @BotFather.');
  process.exit(1);
}

const bot = createBot(token);

bot.launch().then(() => {
  console.log('Бот запущен и слушает Telegram (long polling)');
});

// HTTP-сервер нужен только для приёма вебхуков Cryptomus (оплата картой/крипто).
// Если CRYPTOMUS_* переменные не заданы, кнопка оплаты картой просто не показывается,
// но сервер всё равно поднимаем — Railway ожидает открытый порт для публичного домена.
startWebhookServer(bot);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
