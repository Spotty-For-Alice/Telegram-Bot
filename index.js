const { TELEGRAM_BOT_TOKEN } = require('./credits');
const { 
    AUTH_OPTIONS,
    BOT_OPTIONS
 } = require('./bot-keyboards');
 const { 
    BUTTONS,
    COMMANDS
 } = require('./handled-text');

const TELEGRAM_API = require('node-telegram-bot-api');
const BOT = new TELEGRAM_API(TELEGRAM_BOT_TOKEN, {polling: true});

BOT.setMyCommands([
    {command: COMMANDS.START, description: 'Поздороваться с ботом'},
    {command: COMMANDS.INFO, description: 'Получить информацию о сервисе'},
    {command: COMMANDS.AUTH_OPTIONS, description: 'Login to music services accounts'}
]);

BOT.on('message', async msgData => {    
    handleMessageText(msgData.text, msgData.chat.id)
})

BOT.on('callback_query', async msgData => {
    handleMessageText(msgData.data, msgData.message.chat.id);
})

async function handleMessageText(msgText, chatId) {
    switch (msgText) {
        case COMMANDS.START :
            BOT.sendSticker(chatId, 'https://i.postimg.cc/8Cq2Sk6M/sticker-vk-mikewazowski-004-removebg-preview.webp');
            BOT.sendMessage(chatId, '123', BOT_OPTIONS)
            break;
        
        case COMMANDS.INFO :
            BOT.sendMessage(chatId, 'Информация');
            break;
        
        case COMMANDS.AUTH_OPTIONS :
        case BUTTONS.AUTH : 
            BOT.sendMessage(chatId, 'Авторизация', AUTH_OPTIONS);
            break;
        
        case COMMANDS.SPOTIFY_AUTH :
            BOT.sendMessage(chatId, 'Запрос к Диме, а потом к Жоре');
            break;
        
        case COMMANDS.YANDEX_MUSIC_AUTH :
            BOT.sendMessage(chatId, 'Запрос к Диме, а потом к Филиппу');
            break;
        
        default :
            BOT.sendMessage(chatId, 'Не понял');
    }
}

