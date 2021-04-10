const dotenv = require('dotenv').config();
const EuroBetsService = require('../api/services/EuroBetsService');
const WebScrapingService = require('../api/services/WebScraping_old');
const message = require('../api/util/template-message');
const TelegramBot = require(`node-telegram-bot-api`);
const { getRandomNumber, logger, sleep } = require('../api/util/util');

class Main {
    #bets = [];

    constructor() {

    }

    async start() {
        if (dotenv.error) {
            console.debug(error);
        }
        const { USER, PASS, TOKEN_TELEGRAM, ID_GRUPO } = dotenv.parsed;

        // const telegramService = new TelegramBot(TOKEN_TELEGRAM, { polling: true });
        
        const euroBetsService = new EuroBetsService(USER, PASS);

        let validatedBets = null;
        let timer = 0;

        // função para ficar buscando a cada 1 minuto e enviar msg
        while (true) {
            const headers = await euroBetsService.login();

            const webScraping = new WebScrapingService(headers);

            const myBetsOpen = await webScraping.getScrapBets();

            validatedBets = webScraping.validateBets(myBetsOpen);

            const newBets = await webScraping.verifyNewBets(validatedBets, this.#bets);
            if(Array.isArray(newBets) && newBets.length > 0 ) await webScraping.validationGames(newBets);

            // if (Array.isArray(newBets) && newBets.length > 0) {
            //     const msg = await message.templateMessage(newBets)
            //     telegramService.sendMessage(ID_GRUPO, msg)
            //     .then((success) => console.log('mensagem enviada ao grupo', success))
            //     .catch((err) => console.log('erro ao enviar mensagem para o grupo', err));
            // }

            this.#bets.push(...newBets);
            sleep(getRandomNumber(2,7));
        }
       

        //this.#bets.push(...newBets);

    }

}

module.exports = new Main();