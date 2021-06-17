const dotenv = require('dotenv').config();
const WebScrapingService = require('../api/services/WebScraping');
const { login } = require('../api/services/eurobets-service')
const { getRandomNumber, logger, JsonToString } = require('../api/util/utils');
const delay = require('delay');

class Main {
    #bets = [];

    constructor() {

    }

    async start() {
        const { USER, PASS, MULTIPLYBET, COOKIE } = dotenv.parsed;
        let validatedBets = null;
        let auth = false;
        let headers = null;
        let countAuth = 1;
        while (!auth) {
            logger('[INIT] [EuroBetsService] login()', `user: ${USER}`)
            headers = await login(USER, PASS, COOKIE);
            if (headers['set-cookie']) {
                auth = true
                logger('[END] [EuroBetsService] login()', `headers: AUTENTICADO`, `Tentativas: ${countAuth}`)
            } else {
                logger('[ERRO] [EuroBetsService] login()', `Tentativas: ${countAuth}`)
            }
            countAuth++
        }
        // função para ficar buscando a cada 1 minuto e enviar msg
        while (true) {
            const webScraping = new WebScrapingService(headers);

            const myBetsOpen = await webScraping.getScrapBets();

            if (Array.isArray(myBetsOpen) && myBetsOpen.length > 0) validatedBets = webScraping.validateBets(myBetsOpen);
            let newBets = null
            if (Array.isArray(validatedBets) && validatedBets.length > 0) {
                newBets = await webScraping.verifyNewBets(validatedBets, this.#bets);
                this.#bets.push(...validatedBets);
            }

            if (Array.isArray(newBets) && newBets.length > 0) {
               await webScraping.validationGames(newBets, MULTIPLYBET);
            }

            let time = getRandomNumber(1, 3);
            await delay(time);
        }
    }
}

module.exports = new Main();