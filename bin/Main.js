const dotenv = require('dotenv').config()
const EuroBetsService = require('../api/services/EuroBetsService')
const WebScrapingService = require('../api/services/WebScrapingService')
const VenomBotService = require('../api/services/VenomBotService')
const message = require('../api/util/template-message');

class Main {

    constructor() {

    }

    async start() {
        if (dotenv.error) {
            console.debug(error);
        }

        const { USER, PASS } = dotenv.parsed;

        const venomBotService = await new VenomBotService().create();

        const euroBetsService = new EuroBetsService(USER, PASS);

        let validatedBets = null;
        setInterval(async () => {
            const headers = await euroBetsService.login();

            const webScraping = new WebScrapingService(headers);

            const myBetsOpen = await webScraping.getScrapBets();

            validatedBets = webScraping.validateBets(myBetsOpen);

            if (validatedBets && validatedBets.length > 0) {
                const msg = await message.templateMessage(validatedBets)
                await venomBotService.sendText('554797172810@c.us', msg).then((success) => console.log('mensagem enviada para Junior'))
                await venomBotService.sendText('554796782448@c.us', msg).then((success) => console.log('mensagem enviada para Nicolas'))
            }
        }, 600000)



    }

}

module.exports = new Main();
