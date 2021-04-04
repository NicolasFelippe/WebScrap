const WebAutomation = require('./bin/WebAutomation')
const dotenv = require('dotenv').config()

if (dotenv.error) {
    console.error(error);
}

const { USER, PASS, TOKEN_TELEGRAM, GROUP_ID_TELEGRAM, MULTIPLYBET } = dotenv.parsed;

const webAutomation = new WebAutomation(USER, PASS, TOKEN_TELEGRAM, GROUP_ID_TELEGRAM, MULTIPLYBET);

webAutomation.start();