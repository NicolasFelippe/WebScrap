
const EuroBetsService = require('../api/services/EuroBetsService')
const WebScrapingService = require('../api/services/WebScrapingService')
const message = require('../api/util/template-message');
const { getRandomNumber, logger, sleep } = require('../api/util/util');
class WebAutomation {
    #bets = [];
    #user
    #pass
    #telegramService
    #groupId
    #multiplybet
    constructor(user, pass, telegramService, groupId, multiplybet) {
        this.#user = user
        this.#pass = pass
        this.#telegramService = telegramService
        this.#groupId = groupId // id do grupo do telegram
        this.#multiplybet = multiplybet
    }

    async start() {
        

        const euroBetsService = new EuroBetsService(this.#user, this.#pass);

        while (true) {
            logger('[INIT] [WebAutomation] start()', `User: ${this.#user}`, `MultiplyBet: ${this.#multiplybet}`)
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
                        await euroBetsService.finishBet(openBet, this.#multiplybet);
                    })
                }

                if (Array.isArray(newBets) && newBets.length > 0) {
                    const msg = await message.templateMessage(newBets)
                    this.#telegramService.sendMessage(this.#groupId, msg)
                        .then((success) => logger('[SUCCESS] send message group telegram', `Response: ${success}`))
                        .catch((err) => logger('[ERROR] send message group telegram', `Error: ${err}`));
                }

                this.#bets.push(...newBets);
            }
            logger('[END] [WebAutomation] start()', `Bets: ${JSON.stringify(this.#bets, null, "\t")}`)
            
            sleep(getRandomNumber(3,10));
        }
    }
}

module.exports = WebAutomation;
