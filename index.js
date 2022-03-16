const { TELEGRAM_BOT_TOKEN } = require('./credits');
const { COMMANDS } = require('./constants/handled-text');
const TELEGRAM_API = require('node-telegram-bot-api');
const service = require('./bot-service');

var BOT;

function setUpBot() {
    BOT = new TELEGRAM_API(TELEGRAM_BOT_TOKEN, {polling: true});
    BOT.setMyCommands([
        {command: COMMANDS.START, description: 'Поздороваться с ботом'},
        {command: COMMANDS.INFO, description: 'Получить информацию о сервисе'},
        {command: COMMANDS.AUTH_OPTIONS, description: 'Login to music services accounts'},
        {command: COMMANDS.SYNC_OPTIONS, description: 'Sync music from one music service to another'}
    ]);
    
    BOT.on('message', async msgData => {   
        handleMessageText(msgData.text, msgData.chat.id)
    })
    
    BOT.on('callback_query', async msgData => {
        handleMessageText(msgData.data, msgData.message.chat.id);
        removeInlineKeyboard(msgData.message.message_id, msgData.message.chat.id);
    })
}

function removeInlineKeyboard(msgId, chatId) {
    BOT.editMessageText('Следуйте инструкциям далее', {
        message_id: msgId, 
        chat_id: chatId,
        reply_markup: {
            remove_inline_keyboard: true
        }
    });
}

function handleMessageText(msgText, chatId) {
    service.getMessageForReply(msgText, chatId)
        .then(res => {
            BOT.sendMessage(chatId, res.text, res.options);
        })
        .catch(err => {
            BOT.sendMessage(chatId, err.text);
        });
}

setUpBot();

