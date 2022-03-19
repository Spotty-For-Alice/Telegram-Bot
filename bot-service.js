const { AUTH_OPTIONS, BOT_OPTIONS,SYNC_OPTIONS } = require('./constants/bot-keyboards');
const { BUTTONS, COMMANDS } = require('./constants/handled-text');
const axios = require('axios');

const ALICE_SKILL_LINK = 'https://dialogs.yandex.ru/store/skills/40cd4d84-podklyuchit-sya-k-spo';
const BASE_URL = 'https://2144-194-50-15-255.ngrok.io';
var userState = new Map();

const getMessageForReply = (msgText, chatId) => {
    var reqUrl;
    return new Promise((resolve, reject) => {
        switch (msgText) {
            case COMMANDS.START :
                resolve(buildResponseWithOptions(chatId, 'Приветсвуем всех миломанов!', BOT_OPTIONS));
                break;
            
            case COMMANDS.INFO :
                resolve(buildResponse(chatId, 'Информация'));
                break;
            
            case COMMANDS.AUTH_OPTIONS :
            case BUTTONS.AUTH : 
                resolve(buildResponseWithOptions(chatId, 'Авторизация', AUTH_OPTIONS));
                break;
            
            case COMMANDS.SPOTIFY_AUTH :
                reqUrl = BASE_URL + '/rest/auth/get-url';
                axios.post(reqUrl, {
                    musicProvider: 'SPOTIFY',
                    tgBotId: String(chatId)
                }).then(response => {
                    const authUrl = response.data?.url;
                    resolve(buildResponse(chatId, 'Перейдите по официальной ссылке авторизации Spotify: ' + authUrl));
                }).catch(error => {
                    console.log(reqUrl + ': ' + error.response?.status);
                    reject(buildResponse(chatId, 'Что-то пошло не так, попробуйте еще раз'));
                });
                break;
            
            case COMMANDS.YANDEX_MUSIC_AUTH :
                if (!userState.get(chatId)) {
                    userState.set(chatId, {login : '', password : ''});
                    resolve(buildResponse(chatId, 'Введите логин'));
                } else {
                    reqUrl = BASE_URL + '/rest/auth/yandex-auth';
                    axios.post(reqUrl, {
                        username: userState.get(chatId).login,
                        password: userState.get(chatId).password,
                        tgBotId: String(chatId)
                    }).then(response => {
                        resolve(buildResponse(chatId, 'Авторизация прошла успешно!'));
                    }).catch(error => {
                        console.log(reqUrl + ': ' + error.response?.status);
                        reject(buildResponse(chatId, 'Что-то пошло не так, попробуйте еще раз'));
                    });
                    userState.delete(chatId);
                }
                break;
    
            case COMMANDS.SYNC_OPTIONS :
            case BUTTONS.SYNC:
                resolve(buildResponseWithOptions(
                    chatId, 
                    'Выберете музыкальный сервис, из которого хотите перенести музыку в Яндекс.Музыку: ', 
                    SYNC_OPTIONS)
                );
                break;
    
            case COMMANDS.SPOTIFY_SYNC_TO_YANDEX :
                reqUrl = BASE_URL + '/rest/playlists/transfer-playlist';
                axios.post(reqUrl, {
                    musicProvider: 'SPOTIFY',
                    tgBotId: String(chatId)
                }).then(response => {
                    resolve(buildResponse(chatId, 'Качаю треки!'));
                }).catch(error => {
                    console.log(reqUrl + ': ' + error.response?.status);
                    reject(buildResponse(chatId, 'Что-то пошло не так, попробуйте еще раз авторизироваться в выбранных сервисах'));
                });
                break;
                
            case COMMANDS.SPOTIFY_SHOW_PLAYLISTS :
                reqUrl = BASE_URL + '/rest/playlists/playlists';
                axios.post(reqUrl, {
                    musicProvider: 'SPOTIFY',
                    tgBotId: String(chatId)
                }).then(response => {
                    inline_keyboard = [];
                    response.data.forEach(playlist => {
                        inline_keyboard.push([{text: playlist, callback_data: COMMANDS.PLAYLIST + playlist}]);
                    });
                    resolve(
                        buildResponseWithOptions(
                            chatId, 
                            'Ваши плейлисты:', 
                            { reply_markup: JSON.stringify({inline_keyboard}) }
                        )
                    );
                }).catch(error => {
                    console.log(reqUrl + ': ' + error.response?.status);
                    reject(buildResponse(chatId, 'Что-то пошло не так, попробуйте еще раз авторизироваться в выбранных сервисах'));
                });
                break;

            case COMMANDS.YANDEX_DIALOGS_AUTH :
                resolve(buildResponse(chatId, 'Введи свое имя пользователя yandex в нашем навыке для Алисы по ссылке ' + ALICE_SKILL_LINK));
                
            default :
                /* Handle writing Yandex credentials */
                if (userState.get(chatId)) {
                    if (userState.get(chatId).login === '') {
                        userState.get(chatId).login = msgText;
                        resolve(buildResponse(chatId, 'Введите пароль'));
                    } else {
                        userState.get(chatId).password = msgText;
                        getMessageForReply(COMMANDS.YANDEX_MUSIC_AUTH, chatId)
                            .then(res => {
                                resolve(buildResponse(res.chatId, res.text));
                            })
                            .catch(err => {
                                reject(buildResponse(err.chatId, err.text));
                            });
                    }
                    break;
                }
                /* Handle playlist choise */
                if (msgText.indexOf(COMMANDS.PLAYLIST) != -1) {
                    console.log(msgText.substring(COMMANDS.PLAYLIST.length));
                    reqUrl = BASE_URL + '/rest/playlists/transfer-playlist';
                    axios.post(reqUrl, {
                        musicProvider: 'SPOTIFY',
                        tgBotId: String(chatId),
                        name: msgText.substring(COMMANDS.PLAYLIST.length)
                    }).then(response => {
                        console.log(reqUrl + ': ' + response);
                        resolve(buildResponse(chatId, 'Плейлист получен и уже добавляется в Яндекс.Музуку!'));
                    }).catch(error => {
                        console.log(reqUrl + ': ' + error.response?.status);
                        reject(buildResponse(chatId, 'Что-то пошло не так, попробуйте еще раз авторизироваться в выбранных сервисах'));
                    });
                    break;
                }

                reject(buildResponse(chatId, 'Не удалось распознать команду. С доступным списком команд вы можете ознакомиться в меню бота'));
        }
    });
}

function buildResponse(chatId, text) {
    return {
        chatId: chatId, 
        text: text, 
    };
}

function buildResponseWithOptions(chatId, text, options) {
    return {
        chatId: chatId, 
        text: text, 
        options: options
    };
}

exports.getMessageForReply = getMessageForReply;