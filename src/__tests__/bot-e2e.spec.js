const { BUTTONS, COMMANDS } = require('../constants/handled-text');
const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const Bot = require('../bot');
const axios = require('axios');

require('dotenv').config();

describe('e2e testing', () => {
    const server = new TelegramServer({
      port: 9001
    });

    const botOptions = {
      polling: true, 
      baseApiUrl: server.config.apiURL
    };
    const token = 'testToken';
    const telegramBot = new TelegramBot(token, botOptions);
    
    beforeAll(() => {
      return server.start()
        .then(() => {
          client = server.getClient(token);
          new Bot(telegramBot);
        });
    });
  
    afterAll(() => {
      return server.stop().then(() => {
        telegramBot.stopPolling();
      });
    });

    describe('validate auth', () => {

      it('getting link to open Spotify oauth page', async () => {
        const message = client.makeMessage(COMMANDS.SPOTIFY_AUTH);
        await client.sendMessage(message);
        const updates = await client.getUpdates();
  
        expect(updates.result[0].message?.text?.includes('https://')).toBe(true);
      });

      it('check availability Spotify auth link', async () => {
        const message = client.makeMessage(COMMANDS.SPOTIFY_AUTH);
        await client.sendMessage(message);
        const updates = await client.getUpdates();

        const linkToSpotifyOauth = updates.result[0].message?.text.substring(53);
        const resp = await axios.get(linkToSpotifyOauth);
        
        expect(resp.status).toBe(200);
      });

      it('getting link to open Yandex Dialog page', async () => {
        const message = client.makeMessage(COMMANDS.YANDEX_DIALOGS_AUTH);
        await client.sendMessage(message);
        const updates = await client.getUpdates();
  
        expect(updates.result[0].message?.text?.includes('https://')).toBe(true);
      });

      it('check availability Yadex link', async () => {
        const message = client.makeMessage(COMMANDS.SPOTIFY_AUTH);
        await client.sendMessage(message);
        const updates = await client.getUpdates();

        const linkToSpotifyOauth = updates.result[0].message?.text.substring(53);
        const resp = await axios.get(linkToSpotifyOauth);
        
        expect(resp.status).toBe(200);
      });

      it('auth to Yandex Music', async () => {
        let message = client.makeMessage(COMMANDS.YANDEX_MUSIC_AUTH);
        await client.sendMessage(message);
        let updates = await client.getUpdates();

        message = client.makeMessage('login');
        await client.sendMessage(message);
        updates = await client.getUpdates();

        message = client.makeMessage('password');
        await client.sendMessage(message);
        updates = await client.getUpdates();
        
        // TODO: add assert on normal result
        expect(updates.result[0].message).not.toBe(undefined);
      });
    });

    describe('validate music sync', () => {
      
      it('get playlists', async () => {
        let message = client.makeMessage(COMMANDS.SPOTIFY_SHOW_PLAYLISTS);
        await client.sendMessage(message);
        let updates = await client.getUpdates();

        expect(updates.result[0].message).not.toBe(undefined);

        const playlists = updates.result[0].message.reply_markup.inline_keyboard;
        playlists.forEach(playlistAsArray => {
          expect(playlistAsArray[0].text).not.toBe(undefined);
          expect(playlistAsArray[0].callback_data).not.toBe(undefined);
        });
      });
      
      it('sync favourite playlist', async () => {
        let message = client.makeMessage(COMMANDS.SPOTIFY_SYNC_TO_YANDEX);
        await client.sendMessage(message);
        
        let updates = await client.getUpdates();
        // TODO: add assert on normal result
        expect(updates.result[0].message).not.toBe(undefined);
      });

      it('sync selected playlist', async () => {
        const playlistName = 'TestPlaylist1';
        let message = client.makeMessage(COMMANDS.PLAYLIST + playlistName);
        await client.sendMessage(message);
        
        let updates = await client.getUpdates();

        // TODO: add assert on normal result
        expect(updates.result[0].message).not.toBe(undefined);
      });
    });
  });