const dotenv = require('dotenv').config();
const WebScrapingService = require('../api/services/WebScraping');
// const TelegramBot = require(`node-telegram-bot-api`);
const { login } = require('../api/services/eurobets-service')
const { getRandomNumber, logger, JsonToString } = require('../api/util/utils');
const delay = require('delay');

class Main {
    #bets = [];

    constructor() {

    }

    async start() {
        if (dotenv.error) {
            console.debug(error);
        }
        const { USER, PASS, TOKEN_TELEGRAM, GROUP_ID_TELEGRAM, MULTIPLYBET, COOKIE, GROUP_NOTIFICATION, TELEGRAM } = dotenv.parsed;
        let telegramService = null
        // console.log(TELEGRAM)
        // if (TELEGRAM) {
        //     telegramService = new TelegramBot(TOKEN_TELEGRAM, { polling: true });
        // }
        // FUNÇÃO USADA PARA DESCOBRIR O ID DO GRUPO TELEGRAM
        // telegramService.on('message', (msg) => {
        //     const chatId = msg.chat.id;
        //     console.log(chatId)
        // send a message to the chat acknowledging receipt of their message
        // telegramService.sendMessage(chatId, 'Received your message');
        // });

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

            if (myBetsOpen) validatedBets = webScraping.validateBets(myBetsOpen);

            const newBets = await webScraping.verifyNewBets(validatedBets, this.#bets);

            if (Array.isArray(newBets) && newBets.length > 0) {
                /* if (TELEGRAM) {
                    const msg = JsonToString(newBets.map(bet => ({
                        'Partida': bet.match,
                        'Time Casa': bet.timeCasa,
                        'Time Visitante': bet.timeVisitante,
                        'Data Jogo': `${bet.dataJogo} - ${bet.horaJogo}`,
                        'Aposta': `${bet.statusAposta} - ${bet.time}`,
                        'Odd': bet.odd
                    })))
                    telegramService.sendMessage(GROUP_ID_TELEGRAM, `Novas bets encontradas:\n${msg}`)
                        .then((success) => console.log('mensagem enviada ao grupo'))
                        .catch((err) => console.log('erro ao enviar mensagem para o grupo', err));
                    telegramService.sendMessage(GROUP_NOTIFICATION, `NOVAS ENTRADAS DO BOT:\n${msg}`)
                        .then((success) => logger('mensagem enviada ao grupo de notificação'))
                        .catch((err) => logger('erro ao enviar mensagem para o grupo notificação', JsonToString(err)));
                } */

                const response = await webScraping.validationGames(newBets, MULTIPLYBET);
               /*  if (TELEGRAM) {
                    telegramService.sendMessage(GROUP_ID_TELEGRAM, `SUCESSO REPLICADAS \n ${JsonToString(response)}`)
                        .then((success) => logger('mensagem enviada ao grupo'))
                        .catch((err) => logger('erro ao enviar mensagem para o grupo', JsonToString(err)));
                } */

            }

            if (Array.isArray(newBets)) {
                this.#bets.push(...newBets);
            }
            let time = getRandomNumber(1, 3);
            console.log('await delay ', time)
            await delay(time);
        }
    }
}

module.exports = new Main();