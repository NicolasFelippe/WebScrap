const dotenv = require('dotenv').config()
const TelegramBot = require(`node-telegram-bot-api`);
const EuroBetsService = require('../api/services/EuroBetsService')
const WebScrapingService = require('../api/services/WebScrapingService')
const message = require('../api/util/template-message');
const { getRandomNumber, logger, sleep } = require('../api/util/util');
class WebAutomation {
    #bets = [];
    constructor() { }

    async start() {
        const { USER, PASS, TOKEN_TELEGRAM, GROUP_ID_TELEGRAM, MULTIPLYBET } = dotenv.parsed;

        // const telegramService = new TelegramBot(TOKEN_TELEGRAM, { polling: true });

        const euroBetsService = new EuroBetsService(USER, PASS);

        while (true) {
            logger('[INIT] [WebAutomation] start()', `User: ${USER}`, `MultiplyBet: ${MULTIPLYBET}`)
            const headers = await euroBetsService.login();

            const webScraping = new WebScrapingService(headers);

            const myBetsOpen = await webScraping.getScrapBets();

            const validatedBets = webScraping.validateTimeBets(myBetsOpen);

            if (validatedBets.length > 0) {
                const newBets = await webScraping.verifyNewBets(validatedBets, this.#bets);

                if (Array.isArray(newBets) && newBets.length > 0) {
                    const bets = await webScraping.validationGames(newBets);
                    bets.forEach(async ({ idJogo, openBet }) => {
                        const market = await euroBetsService.getGameOptions(idJogo, openBet);
                        await euroBetsService.registerBet(market.id, idJogo);
                        await euroBetsService.finishBet(openBet, MULTIPLYBET);
                    })
                }

                // if (Array.isArray(newBets) && newBets.length > 0) {
                //     const msg = await message.templateMessage(newBets)
                //     this.#telegramService.sendMessage(GROUP_ID_TELEGRAM, msg)
                //         .then((success) => logger('[SUCCESS] send message group telegram', `Response: ${success}`))
                //         .catch((err) => logger('[ERROR] send message group telegram', `Error: ${err}`));
                // }

                this.#bets.push(...newBets);
            }
            logger('[END] [WebAutomation] start()', `Bets: ${JSON.stringify(this.#bets, null, "\t")}`)

            sleep(getRandomNumber(2,7));
        }
    }
}

module.exports = WebAutomation;
