const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

let bot;
try {
  bot = new TelegramBot(process.env.BOT_TOKEN, { 
    polling: true,
    // Добавляем параметры для избежания конфликтов
    webHook: false,
    testEnvironment: true
  });

  // Обработка ошибок polling
  bot.on('polling_error', (error) => {
    console.log('Polling error:', error.code);
    if (error.code === 'ETELEGRAM' && error.message.includes('terminated by other getUpdates request')) {
      console.log('Restarting polling...');
      bot.stopPolling().then(() => {
        setTimeout(() => {
          bot.startPolling();
        }, 10000);
      });
    }
  });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to Egg Timer! Use /timer to start.');
  });

  bot.onText(/\/timer/, (msg) => {
    const chatId = msg.chat.id;
    const appUrl = process.env.APP_URL || 'https://eggbtimerbit.onrender.com';
    bot.sendMessage(chatId, 'Open the timer:', {
      reply_markup: {
        inline_keyboard: [[
          { text: 'Open Timer', web_app: { url: appUrl } }
        ]]
      }
    });
  });
} catch (error) {
  console.error('Bot initialization error:', error);
}
