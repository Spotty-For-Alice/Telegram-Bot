const Bot = require('./bot');

function setUpBot() {
    const telegramBot = new TELEGRAM_API(TELEGRAM_BOT_TOKEN, {polling: true});
    new Bot(telegramBot);
}

setUpBot();

