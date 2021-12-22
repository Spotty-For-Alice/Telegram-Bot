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
const BASE_URL = 'https://9ace-194-50-15-255.ngrok.io';

var userState = new Map();

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
    removeInlineKeyboard(msgData.message.message_id, msgData.message.chat.id);
})

function removeInlineKeyboard(msgId, chatId) {
    BOT.editMessageText('Следуйте инструкциям далее', {
        message_id: msgId, 
        chat_id: chatId,
        reply_markup: {
            remove_inline_keyboard: true
        }
    });
}

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
            if (!userState.get(chatId)) {
                BOT.sendMessage(chatId, 'Введите логин');
                userState.set(chatId, {login : '', password : ''});
            } else {
                axios.post(BASE_URL + '/rest/auth/yandex-auth', {
                    username: userState.get(chatId).login,
                    password: userState.get(chatId).password,
                    tgBotId: String(chatId)
                }).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error.response?.status);
                });
                userState.delete(chatId);
            }
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
            
        case COMMANDS.SPOTIFY_SHOW_PLAYLISTS :
            axios.post(BASE_URL + '/rest/playlists/playlists', {
                musicProvider: 'SPOTIFY',
                tgBotId: String(chatId)
            }).then(response => {
                inline_keyboard = [];
                response.data.forEach(playlist => {
                    inline_keyboard.push([{text: playlist, callback_data: COMMANDS.PLAYLIST + playlist}]);
                });
                BOT.sendMessage(chatId, 'Ваши плейлисты:', {reply_markup: JSON.stringify({inline_keyboard})});
            }).catch(error => {
                console.log(error.response?.status);
            });
            break;

        case msgText.substring(COMMANDS.PLAYLIST) != -1 :
            console.log(msgText.substring(COMMANDS.PLAYLIST.length));
            
        default :
            /* Handle writing Yandex credentials */
            if (userState.get(chatId)) {
                if (userState.get(chatId).login === '') {
                    userState.get(chatId).login = msgText;
                    BOT.sendMessage(chatId, 'Введите пароль');
                } else {
                    userState.get(chatId).password = msgText;
                    handleMessageText(COMMANDS.YANDEX_MUSIC_AUTH, chatId);
                }
                break;
            }
            /* Handle playlist choise */
            if (msgText.substring(COMMANDS.PLAYLIST) != -1) {
                console.log(msgText.substring(COMMANDS.PLAYLIST.length));
                axios.post(BASE_URL + '/rest/playlists/transfer-playlist', {
                    musicProvider: 'SPOTIFY',
                    tgBotId: String(chatId),
                    name: msgText.substring(COMMANDS.PLAYLIST.length)
                }).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error.response?.status);
                });
                break;
            }
            BOT.sendMessage(chatId, 'Не удалось распознать команду. С доступным списком команд вы можете ознакомиться в меню бота');
    }
}

