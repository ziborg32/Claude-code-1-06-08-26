require('dotenv').config();
const { createBot } = require('./src/bot');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN не задан. Скопируйте .env.example в .env и укажите токен от @BotFather.');
  process.exit(1);
}

const bot = createBot(token);

bot.launch().then(() => {
  console.log('Бот запущен и слушает Telegram (long polling)');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
