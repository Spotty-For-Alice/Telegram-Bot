const { TELEGRAM_BOT_TOKEN } = require('./credits');

const TELEGRAM_API = require('node-telegram-bot-api');
const BOT = new TELEGRAM_API(TELEGRAM_BOT_TOKEN, {polling: true});

const COMMANDS = {
    START : '/start',
    INFO : '/info'
};

BOT.setMyCommands([
    {command: COMMANDS.START, description: 'Поздороваться с ботом'},
    {command: COMMANDS.INFO, description: 'Получить информацию о сервисе'},
    {command: '/spotify_auth', description: 'Login Spotify account'}
]);

BOT.on('message', msgData => {    
    handleMessageText(msgData.text, msgData.chat.id)
})

async function handleMessageText(msgText, chatId) {
    switch (msgText) {
        case COMMANDS.START :
            BOT.sendSticker(chatId, 'https://i.postimg.cc/8Cq2Sk6M/sticker-vk-mikewazowski-004-removebg-preview.webp');
            break;
        case COMMANDS.INFO :
            BOT.sendMessage(chatId, 'Информация');
            break;
        default :
            BOT.sendMessage(chatId, 'Не понял');
    }
}
