const { BUTTONS, COMMANDS } = require('../constants/handled-text');
const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const Bot = require('../bot');

require('dotenv').config()


describe('E2E', () => {
    const server = new TelegramServer(
      {port: 9001}
    );

    const botOptions = {
      polling: true, 
      baseApiUrl: server.config.apiURL
    };
    const token = 'testToken';
    const telegramBot = new TelegramBot(token, botOptions);
    
    beforeAll(() => {
      console.log('!!!!');
      console.log(process.env.REQUEST_HANDLER_URL);

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
  
    it('lalalal', async () => {
      const message = client.makeMessage(COMMANDS.SPOTIFY_AUTH);
      await client.sendMessage(message);
      
      const updates = await client.getUpdates();

      console.log(updates.result[0].message);

      expect(updates.result[0].message).not.toBe(undefined);
    });
  });