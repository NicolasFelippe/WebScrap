const dotenv = require('dotenv').config()
const EuroBetsService = require('../api/services/EuroBetsService')
const WebScrapingService = require('../api/services/WebScrapingService')
const message = require('../api/util/template-message');
const TelegramBot = require(`node-telegram-bot-api`)
class Main {
    #bets = [];

    constructor() {

    }

    async start() {
        if (dotenv.error) {
            console.debug(error);
        }
        const { USER, PASS, TOKEN_TELEGRAM, ID_GRUPO } = dotenv.parsed;

        const telegramService = new TelegramBot(TOKEN_TELEGRAM, { polling: true });
        // telegramService.on('message', function (msg) {
        //     const chatId = msg.chat.id;
        //     console.log(msg)
        //     // send a message to the chat acknowledging receipt of their message
        //     telegramService.sendMessage('-578125053', 'Received your message');
        //   });
        const euroBetsService = new EuroBetsService(USER, PASS);

        let validatedBets = null;
        let timer = 0;

        // função para ficar buscando a cada 1 minuto e enviar msg
        setInterval(async () => {
            const headers = await euroBetsService.login();

            const webScraping = new WebScrapingService(headers);

            const myBetsOpen = await webScraping.getScrapBets();

            validatedBets = webScraping.validateBets(myBetsOpen);

            const newBets = await webScraping.verifyNewBets(validatedBets, this.#bets);
            if(Array.isArray(newBets) && newBets.length > 0 ) await webScraping.validationGames(newBets);

            if (Array.isArray(newBets) && newBets.length > 0) {
                const msg = await message.templateMessage(newBets)
                telegramService.sendMessage(ID_GRUPO, msg)
                .then((success) => console.log('mensagem enviada ao grupo', success))
                .catch((err) => console.log('erro ao enviar mensagem para o grupo', err));
                // await venomBotService.sendText('554797172810@c.us', msg).then((success) => console.log('mensagem enviada para Junior'))
                // await venomBotService.sendText('554796782448@c.us', msg).then((success) => console.log('mensagem enviada para Nicolas'))
            }

            this.#bets.push(...newBets);
            timer = 30000;
        }, 30000)

        //this.#bets.push(...newBets);

    }

}

module.exports = new Main();
