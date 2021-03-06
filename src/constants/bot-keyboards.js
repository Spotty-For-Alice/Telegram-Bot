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
                [{text: 'Яндекс.Музыка', callback_data: COMMANDS.YANDEX_MUSIC_AUTH}],
                [{text: 'Яндекс.Диалоги', callback_data: COMMANDS.YANDEX_DIALOGS_AUTH}]
            ]
        })
    },

    SYNC_OPTIONS : {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Spotify "Любимые треки"', callback_data: COMMANDS.SPOTIFY_SYNC_TO_YANDEX}, {text: 'Выбрать плейлист', callback_data: COMMANDS.SPOTIFY_SHOW_PLAYLISTS}],
            ]
        })
    }
}