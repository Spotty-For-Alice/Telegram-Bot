const mockAxios = require('axios');

const { BUTTONS, COMMANDS } = require('./handled-text');
const service = require('./bot-service');

jest.mock('axios');

const errorMessage = 'Что-то пошло не так';
const chatId = 12345;

describe("Validate auth button handling", () => {
    it ('chat id and message text', () => {
        return service.getMessageForReply(BUTTONS.AUTH, chatId).then(res => {
            expect(res.chatId).toEqual(chatId);
            expect(res.text.includes(errorMessage)).toBe(false);
        })
    });
    it ('inline keybiard has button for Spotify auth', () => {
        return service.getMessageForReply(BUTTONS.AUTH, 12345).then(res => {
            expect(res.options).not.toBeNull();
            const hasSpotify = JSON.stringify(res.options).includes('Spotify');
            expect(hasSpotify).toBe(true);
        })
    });
    it ('inline keybiard has button for Yandex Music auth', () => {
        return service.getMessageForReply(BUTTONS.AUTH, 12345).then(res => {
            expect(res.options).not.toBeNull();
            const hasSpotify = JSON.stringify(res.options).includes('Яндекс');
            expect(hasSpotify).toBe(true);
        })
    });
});

describe("Validate base commands", () => {
    it ('/start', () => {
        return service.getMessageForReply(COMMANDS.START, chatId).then(res => {
            expect(res.text.length).not.toBe(0);
            expect(res.text.includes('Привет')).toBe(true);
        })
    });
    it ('/info', () => {
        return service.getMessageForReply(COMMANDS.INFO, chatId).then(res => {
            expect(res.text.length).not.toBe(0);
            expect(res.text.includes('Информация')).toBe(true);
        })
    });
    it ('simple text', () => {
        return service.getMessageForReply('simple text', chatId).catch(err => {
            expect(err.text.includes('Не удалось распознать команду')).toBe(true);
        })
    });
});

describe("Validate auth commands", () => {
    const outhURL = 'https://spotify.com';

    it ('get spotify oath 2.0 url', () => {
        mockAxios.post.mockImplementationOnce(() => Promise.resolve({
            response: { status: 200 },
            data: { url: outhURL }
        }));
        return service.getMessageForReply(COMMANDS.SPOTIFY_AUTH, chatId)
            .then(res => {
                expect(res.text.includes(outhURL)).toBe(true);
            })
    });

    it ('handle errors in getting spotify oauth url', () => {
        mockAxios.post.mockImplementationOnce(() => Promise.reject({
            response: { status: 400 }
        }));
        return service.getMessageForReply(COMMANDS.SPOTIFY_AUTH, chatId)
            .catch(err => {
                expect(err.text.includes(errorMessage)).toBe(true);
            })
    });

    it ('write yandex music credentials', () => {
        mockAxios.post.mockImplementationOnce(() => Promise.resolve({
            response: { status: 200 }
        }));
        const login = 'login';
        const password = 'password';

        return service.getMessageForReply(COMMANDS.YANDEX_MUSIC_AUTH, chatId)
            .then(res => {
                expect(res.text.includes('логин')).toBe(true);
                return service.getMessageForReply(login, chatId)
            })
            .then(res => {
                expect(res.text.includes('пароль')).toBe(true);
                return service.getMessageForReply(password, chatId)
            })
            .then(res => {
                expect(res.text.includes('Авторизация прошла успешно')).toBe(true);
            })
    });

    it ('write invalid yandex music credentials', () => {
        mockAxios.post.mockImplementationOnce(() => Promise.reject({
            response: { status: 400 }
        }));
        const login = 'login';
        const falsePassword = 'password';

        return service.getMessageForReply(COMMANDS.YANDEX_MUSIC_AUTH, chatId)
            .then(res => {
                expect(res.text.includes('логин')).toBe(true);
                return service.getMessageForReply(login, chatId)
            })
            .then(res => {
                expect(res.text.includes('пароль')).toBe(true);
                return service.getMessageForReply(falsePassword, chatId)
            })
            .catch(err => {
                expect(err.text.includes(errorMessage)).toBe(true);
            })
    });
});

describe("Sync music between music services", () => {
    it ('Show sync menu', () => {
        return service.getMessageForReply(COMMANDS.SYNC_OPTIONS, chatId)
            .catch(res => {
                expect(res.text.includes('Выберете')).toBe(true);
            })
    });

    it ('Select favourite music playlist', () => {
        mockAxios.post.mockImplementationOnce(() => Promise.resolve({
            response: { status: 200 }
        }));
        return service.getMessageForReply(COMMANDS.SPOTIFY_SYNC_TO_YANDEX, chatId)
            .then(res => {
                expect(res.text.includes('Качаю треки')).toBe(true);
            })
    });

    it ('Select favourite music playlist and failed sync', () => {
        mockAxios.post.mockImplementationOnce(() => Promise.reject({
            response: { status: 400 }
        }));
        return service.getMessageForReply(COMMANDS.SPOTIFY_SYNC_TO_YANDEX, chatId)
            .catch(err => {
                expect(err.text.includes(errorMessage)).toBe(true);
            })
    });

    it ('Show spotify playlists', () => {
        mockAxios.post.mockImplementationOnce(() => Promise.resolve({
            response: { status: 200 },
            data: ['Playlist1', 'Playlist100']
        }));
        return service.getMessageForReply(COMMANDS.SPOTIFY_SHOW_PLAYLISTS, chatId)
            .then(res => {
                expect(res.text.includes('плейлисты')).toBe(true);
                expect(JSON.stringify(res.options).includes('Playlist1')).toBe(true);
                expect(JSON.stringify(res.options).includes('Playlist100')).toBe(true);
            })
    });

    it ('Failed to get playlists', () => {
        mockAxios.post.mockImplementationOnce(() => Promise.reject({
            response: { status: 400 }
        }));
        return service.getMessageForReply(COMMANDS.SPOTIFY_SHOW_PLAYLISTS, chatId)
            .catch(err => {
                expect(err.text.includes(errorMessage)).toBe(true);
            })
    });

    it ('Select playlist from list', () => {
        const playlist = 'Playlist1';

        mockAxios.post.mockImplementationOnce(() => Promise.resolve({
            response: { status: 200 },
            data: [playlist]
        }));

        return service.getMessageForReply(COMMANDS.PLAYLIST + playlist, chatId)
            .then(res => {
                expect(res.text.includes('Плейлист получен')).toBe(true);
            })
    });

    it ('Select playlist from list', () => {
        const playlist = 'Playlist1';

        mockAxios.post.mockImplementationOnce(() => Promise.reject({
            response: { status: 400 }
        }));

        return service.getMessageForReply(COMMANDS.PLAYLIST + playlist, chatId)
            .catch(err => {
                expect(err.text.includes(errorMessage)).toBe(true);
            })
    });
});


