const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const Bot = require('../bot');

const mockAxios = require('axios');
jest.mock('axios');

describe('Telegram bot integraion tests', () => {
    const serverConfig = {
      port: 9001
    };
    const token = 'sampleToken';
    
    var server;
    var client;
    
    beforeEach(() => {
      server = new TelegramServer(serverConfig);
      return server.start()
        .then(() => {
          client = server.getClient(token);
          const botOptions = {
            polling: true, 
            baseApiUrl: server.config.apiURL
          };
          new Bot(
            new TelegramBot(token, botOptions)
          );
        });
    });
  
    afterEach(() => {
      return server.stop();
    });
  
    it('get reply for client input command', async () => {
      const message = client.makeMessage('/start');
      await client.sendMessage(message);
      
      const updates = await client.getUpdates();

      expect(updates.result[0].message).not.toBe(undefined);
    });

    it('get reply for client input keyboard commands', async () => {
      var message = client.makeMessage('/start');
      await client.sendMessage(message);
      var updates = await client.getUpdates();

      const keyboard = updates.result[0].message.reply_markup.keyboard;
      message = client.makeMessage(keyboard[0][0]);
      
      await client.sendMessage(message);
      updates = await client.getUpdates();
          
      expect(updates.result).not.toBe(undefined);
    });

    it('get reply for client simple text', async () => {
      var message = client.makeMessage('simple test text');
      await client.sendMessage(message);
      var updates = await client.getUpdates();
          
      expect(updates.result).not.toBe(undefined);
    });
  });