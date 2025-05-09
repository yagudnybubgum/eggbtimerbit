const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;
const appUrl = process.env.APP_URL || 'https://eggbtimerbit.onrender.com';

// Для webhook нужен bodyParser
app.use(express.json());
app.use(express.static('public'));

let bot;
try {
  // Инициализируем бота без явного указания порта
  bot = new TelegramBot(process.env.BOT_TOKEN);

  // Устанавливаем webhook
  bot.setWebHook(`${appUrl}/webhook/${process.env.BOT_TOKEN}`);

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });

  // Обрабатываем webhook запросы
  app.post(`/webhook/${process.env.BOT_TOKEN}`, (req, res) => {
    bot.emit('message', req.body);
    res.sendStatus(200);
  });

  // Endpoint для получения уведомления о завершении таймера
  app.post('/timer-complete', (req, res) => {
    const { chat_id } = req.body;
    if (chat_id) {
      bot.sendMessage(chat_id, '🥚 Пора доставать яйца! Приятного аппетита!');
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  });

  // Команда /start
  bot.on('message', (msg) => {
    if (msg.text === '/start') {
      bot.sendMessage(msg.chat.id, 'Welcome to Egg Timer! Use /timer to start.');
    } else if (msg.text === '/timer') {
      bot.sendMessage(msg.chat.id, 'Open the timer:', {
        reply_markup: {
          inline_keyboard: [[
            { text: 'Open Timer', web_app: { url: appUrl } }
          ]]
        }
      });
    }
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Webhook URL: ${appUrl}/webhook/${process.env.BOT_TOKEN}`);
  });

} catch (error) {
  console.error('Bot initialization error:', error);
}
