const { TELEGRAM_BOT_TOKEN } = require('./credits');
const { 
    AUTH_OPTIONS,
    BOT_OPTIONS,
    SYNC_OPTIONS
 } = require('./bot-keyboards');
 const { 
    BUTTONS,
    COMMANDS
 } = require('./handled-text');

const axios = require('axios');

const TELEGRAM_API = require('node-telegram-bot-api');
const BOT = new TELEGRAM_API(TELEGRAM_BOT_TOKEN, {polling: true});

const BASE_URL = 'https://d58e-194-50-15-255.ngrok.io';

BOT.setMyCommands([
    {command: COMMANDS.START, description: 'Поздороваться с ботом'},
    {command: COMMANDS.INFO, description: 'Получить информацию о сервисе'},
    {command: COMMANDS.AUTH_OPTIONS, description: 'Login to music services accounts'},
    {command: COMMANDS.SYNC_OPTIONS, description: 'Sync music from one music service to another'}
]);

BOT.on('message', async msgData => {   
    //console.log(msgData);
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
            BOT.sendMessage(chatId, 'Перейдите по официальной ссылке авторизации Spotify: ');
            axios.post(BASE_URL + '/rest/auth/get-url', {
                musicProvider: 'SPOTIFY',
                tgBotId: String(chatId)
            }).then(response => {
                const authUrl = response.data?.url;
                BOT.sendMessage(chatId, authUrl);
            }).catch(error => {
                console.log(error.response?.status);
            });
            break;
        
        case COMMANDS.YANDEX_MUSIC_AUTH :
            BOT.sendMessage(chatId, 'Запрос к Диме, а потом к Филиппу');
            break;

        case COMMANDS.SYNC_OPTIONS :
        case BUTTONS.SYNC:
            BOT.sendMessage(chatId, 'Выберете музыкальный сервис, из которого хотите перенести музыку в Яндекс.Музыку: ', SYNC_OPTIONS);
            break;

        case COMMANDS.SPOTIFY_SYNC_TO_YANDEX :
            BOT.sendMessage(chatId, 'Качаю треки!');
            axios.post(BASE_URL + '/rest/playlists/transfer-playlist', {
                musicProvider: 'SPOTIFY',
                tgBotId: String(chatId)
            }).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error.response?.status);
            });
            break;
        
        default :
            BOT.sendMessage(chatId, 'Не понял');
    }
}

