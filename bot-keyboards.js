const {
    BUTTONS, COMMANDS
} = require('./handled-text');

module.exports = {
    BOT_OPTIONS : {
        reply_markup: JSON.stringify({
            keyboard: [
                [BUTTONS.AUTH],
                [BUTTONS.SYNC]
            ]
        })
    },

    AUTH_OPTIONS : {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Spotify', callback_data: COMMANDS.SPOTIFY_AUTH}],
                [{text: 'Яндекс.Музыка', callback_data: COMMANDS.YANDEX_MUSIC_AUTH}]
            ]
        })
    }
}