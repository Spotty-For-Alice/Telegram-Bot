require('dotenv').config();
const express = require('express');
const packageInfo = require('./package.json');
const TELEGRAM_API = require('node-telegram-bot-api');

const Bot = require('./bot');

function setUpBot() {
    const telegramBot = new TELEGRAM_API(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
    new Bot(telegramBot);
}

setUpBot();

