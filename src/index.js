require('dotenv').config();
const express = require('express');
const packageInfo = require('../package.json');
const TELEGRAM_API = require('node-telegram-bot-api');

var app = express();

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

var server = app.listen(process.env.PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Web server started at http://%s:%s', host, port);
});

const Bot = require('./bot');

function setUpBot() {
    const telegramBot = new TELEGRAM_API(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
    new Bot(telegramBot);
}

setUpBot();
