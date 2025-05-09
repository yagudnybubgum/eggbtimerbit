const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const appUrl = process.env.APP_URL || 'https://eggbtimerbit.onrender.com';

// Для webhook нужен bodyParser
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

let bot;
try {
  // Инициализируем бота в режиме webhook
  bot = new TelegramBot(process.env.BOT_TOKEN, {
    webHook: {
      port: port
    }
  });

  // Устанавливаем webhook
  bot.setWebHook(`${appUrl}/webhook/${process.env.BOT_TOKEN}`);

  // Обрабатываем webhook запросы
  app.post(`/webhook/${process.env.BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
  });

  // Команда /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to Egg Timer! Use /timer to start.');
  });

  // Команда /timer
  bot.onText(/\/timer/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Open the timer:', {
      reply_markup: {
        inline_keyboard: [[
          { text: 'Open Timer', web_app: { url: appUrl } }
        ]]
      }
    });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Webhook URL: ${appUrl}/webhook/${process.env.BOT_TOKEN}`);
  });

} catch (error) {
  console.error('Bot initialization error:', error);
}
