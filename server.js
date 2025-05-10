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
  const eggPhrases = [
    '🥚 Пора доставать яйца! Приятного аппетита!',
    '🍳 Завтрак готов! Не забудь посолить!',
    '😋 Самое время для идеального яйца!',
    '🥚 Время вышло — яйца ждут тебя!',
    '🔥 Яйца готовы! Не передержи!',
    '⏰ Таймер сработал, пора наслаждаться яйцами!',
    '🥄 Ложка наготове? Яйца уже ждут!',
    '👌 Идеальная консистенция! Приятного аппетита!',
    '🥚 Яйца сварились! Можно звать всех к столу!',
    '😎 Яйца готовы, как и ты к новому дню!',
    '🥚 Время для вкусного перекуса!',
    '🍽️ Яйца ждут! Не забудь хлебушек!',
    '🥚 Пора чистить яйца и наслаждаться!',
    '🎉 Яйца готовы! Пусть день будет удачным!',
    '🥚 Время для идеального завтрака!',
    '🥚 Яйца сварились! Самое время их попробовать!',
    '🍳 Приятного аппетита! Пусть яйца будут идеальны!',
    '🥚 Яйца ждут тебя! Не заставляй их остывать!',
    '🥚 Время вышло! Яйца готовы к подаче!',
    '🥚 Яйца готовы! Пусть завтрак будет вкусным!',
    '🥚 Самое время для яйца всмятку!',
    '🥚 Яйца сварились! Приятного аппетита!',
    '🥚 Время для яйца в мешочек!',
    '🥚 Яйца вкрутую готовы! Можно начинать!',
    '🥚 Яйца ждут тебя! Не забудь поделиться с близкими!',
    '🥚 Завтрак готов! Пусть день будет продуктивным!',
    '🥚 Яйца готовы! Самое время сделать тост!',
    '🥚 Яйца сварились! Пусть настроение будет отличным!',
    '🥚 Время для идеального яйца! Приятного аппетита!',
    '🥚 Яйца готовы! Пусть день начнётся вкусно!',
    '🥚 Яйца сварились! Наслаждайся!' 
  ];

  app.post('/timer-complete', (req, res) => {
    const { chat_id } = req.body;
    if (chat_id) {
      const phrase = eggPhrases[Math.floor(Math.random() * eggPhrases.length)];
      bot.sendMessage(chat_id, phrase);
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
