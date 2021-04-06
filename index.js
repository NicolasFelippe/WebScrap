const dotenv = require('dotenv').config()
const WebAutomation = require('./bin/WebAutomation')
const TelegramBot = require(`node-telegram-bot-api`);

if (dotenv.error) {
    console.error(error);
}

const { USER, PASS, TOKEN_TELEGRAM, GROUP_ID_TELEGRAM, MULTIPLYBET } = dotenv.parsed;

const telegramService = new TelegramBot(TOKEN_TELEGRAM, { polling: true });

const webAutomation = new WebAutomation(USER, PASS, telegramService, GROUP_ID_TELEGRAM, MULTIPLYBET);

webAutomation.start();