const dotenv = require('dotenv').config();
const EuroBetsService = require('../api/services/EuroBetsService_old');
const WebScrapingService = require('../api/services/WebScraping');
const TelegramBot = require(`node-telegram-bot-api`);
const { login } = require('../api/services/eurobets-service')
const { getRandomNumber, logger, sleep, JsonToString } = require('../api/util/utils');

class Main {
    #bets = [];

    constructor() {

    }

    async start() {
        if (dotenv.error) {
            console.debug(error);
        }
        const { USER, PASS, TOKEN_TELEGRAM, GROUP_ID_TELEGRAM, MULTIPLYBET, COOKIE } = dotenv.parsed;

        //const telegramService = new TelegramBot(TOKEN_TELEGRAM, { polling: true });

        // const euroBetsService = new EuroBetsService(USER, PASS);

        let validatedBets = null;
        let auth = false
        let headers = null
        let countAuth = 1
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

            validatedBets = webScraping.validateBets(myBetsOpen);

            const newBets = await webScraping.verifyNewBets(validatedBets, this.#bets);
            if (Array.isArray(newBets) && newBets.length > 0) {
                /* telegramService.sendMessage(GROUP_ID_TELEGRAM, `Novas bets encontradas:\n${JsonToString(newBets)}`)
                    .then((success) => console.log('mensagem enviada ao grupo'))
                    .catch((err) => console.log('erro ao enviar mensagem para o grupo', err)); */

                const response = await webScraping.validationGames(newBets, MULTIPLYBET);
                /* telegramService.sendMessage(GROUP_ID_TELEGRAM, `SUCESSO REPLICADAS \n ${JsonToString(response)}`)
                    .then((success) => console.log('mensagem enviada ao grupo'))
                    .catch((err) => console.log('erro ao enviar mensagem para o grupo', err)); */
            }



            if(Array.isArray(newBets)){
                this.#bets.push(...newBets)
            } 
            sleep(getRandomNumber(2, 7));
        }
        //this.#bets.push(...newBets);
    }

}

module.exports = new Main();