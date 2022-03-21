const { TELEGRAM_BOT_TOKEN } = require('./credits');
const TELEGRAM_API = require('node-telegram-bot-api');

const { COMMANDS } = require('./constants/handled-text');
const service = require('./bot-service');

module.exports = class MyBot {
    BOT;

    constructor(bot) {
        this.BOT = bot;
        this.setUpBot();
    }

    setUpBot() {
        this.BOT.setMyCommands([
            {command: COMMANDS.START, description: 'Поздороваться с ботом'},
            {command: COMMANDS.INFO, description: 'Получить информацию о сервисе'},
            {command: COMMANDS.AUTH_OPTIONS, description: 'Login to music services accounts'},
            {command: COMMANDS.SYNC_OPTIONS, description: 'Sync music from one music service to another'}
        ]);
        
        this.BOT.on('message', async msgData => {   
            this.handleMessageText(msgData.text, msgData.chat.id)
        });
        
        this.BOT.on('callback_query', async msgData => {
            this.handleMessageText(msgData.data, msgData.message.chat.id);
            this.removeInlineKeyboard(msgData.message.message_id, msgData.message.chat.id);
        });
    }

    removeInlineKeyboard(msgId, chatId) {
        this.BOT.editMessageText('Следуйте инструкциям далее', {
            message_id: msgId, 
            chat_id: chatId,
            reply_markup: {
                remove_inline_keyboard: true
            }
        });
    }
    
    handleMessageText(msgText, chatId) {
        service.getMessageForReply(msgText, chatId)
            .then(res => {
                this.BOT.sendMessage(chatId, res.text, res.options);
            })
            .catch(err => {
                this.BOT.sendMessage(chatId, err.text);
            });
    }
}