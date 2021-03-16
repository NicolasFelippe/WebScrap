const dotenv = require('dotenv').config()
const EuroBetsService = require('../api/services/EuroBetsService')
const WebScrapingService = require('../api/services/WebScrapingService')
const VenomBotService = require('../api/services/VenomBotService')
const message = require('../api/util/template-message');

class Main {
    #bets = [];

    constructor() {

    }

    async start() {
        if (dotenv.error) {
            console.debug(error);
        }
        console.log('dir', __dirname)
        const { USER, PASS } = dotenv.parsed;


        // DESCOMENTAR PARA CRIAR O SERVIÇO DO BOT WHATS
        const venomBotService = await new VenomBotService().create();

        const euroBetsService = new EuroBetsService(USER, PASS);

        let validatedBets = null;
        let timer = 0;
       /*  const headers = await euroBetsService.login();

        const webScraping = new WebScrapingService(headers);

        const myBetsOpen = await webScraping.getScrapBets();

        validatedBets = webScraping.validateBets(myBetsOpen);

        const newBets = webScraping.verifyNewBets(validatedBets, this.#bets); */

        // função para ficar buscando a cada 1 minuto e enviar msg
        setInterval(async () => {
            const headers = await euroBetsService.login();

            const webScraping = new WebScrapingService(headers);

            const myBetsOpen = await webScraping.getScrapBets();

            validatedBets = webScraping.validateBets(myBetsOpen);

            const newBets = webScraping.verifyNewBets(validatedBets, this.#bets);

            if (newBets && newBets.length > 0) {
                const msg = await message.templateMessage(newBets)
                await venomBotService.sendText('554797172810@c.us', msg).then((success) => console.log('mensagem enviada para Junior'))
                await venomBotService.sendText('554796782448@c.us', msg).then((success) => console.log('mensagem enviada para Nicolas'))
            }

            this.#bets.push(...newBets);
            timer = 60000;
        }, 60000)

        //this.#bets.push(...newBets);

    }

}

module.exports = new Main();
