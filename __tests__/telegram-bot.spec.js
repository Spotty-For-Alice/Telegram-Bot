const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const MyBot = require('../bot');

describe('Telegram bot test', () => {
    let serverConfig = {port: 9001};
    const token = 'sampleToken';
    let server;
    let client;
    beforeEach(() => {
      server = new TelegramServer(serverConfig);
      return server.start().then(() => {
        client = server.getClient(token);
      });
    });
  
    afterEach(function () {
      return server.stop();
    });
  
    it('should greet Masha and Sasha', async function testFull() {
        
      const message = client.makeMessage('/start');
      await client.sendMessage(message);
      const botOptions = {polling: true, baseApiUrl: server.config.apiURL};
      const telegramBot = new TelegramBot(token, botOptions);
      new MyBot(telegramBot);
      const updates = await client.getUpdates();
      console.log(`Client received messages: ${JSON.stringify(updates.result)}`);
      return true;
    });
  });