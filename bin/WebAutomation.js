
const dotenv = require('dotenv').config()
const EuroBetsService = require('../api/services/EuroBetsService')
const WebScrapingService = require('../api/services/WebScrapingService')
const message = require('../api/util/template-message');
const TelegramBot = require(`node-telegram-bot-api`);
const { getRandomNumber, logger } = require('../api/util/util');

class WebAutomation {
    #bets = [];
    #user
    #pass
    #tokenTelegram
    #groupId
    #multiplybet
    constructor(user, pass, tokenTelegram, groupId, multiplybet) {
        this.#user = user
        this.#pass = pass
        this.#tokenTelegram = tokenTelegram
        this.#groupId  = groupId // id do grupo do telegram
        this.#multiplybet = multiplybet
    }

    async start() {
        const telegramService = new TelegramBot(this.#tokenTelegram, { polling: true });
       
        const euroBetsService = new EuroBetsService(this.#user, this.#pass);

        let timer = 0;

        // função para ficar buscando a cada 1 minuto e enviar msg
        setInterval(async () => {
            logger('[INIT] [WebAutomation] start()', `User: ${this.#user}`, `MultiplyBet: ${this.#multiplybet}`)
            const headers = await euroBetsService.login();

            const webScraping = new WebScrapingService(headers);

            const myBetsOpen = await webScraping.getScrapBets();

            const validatedBets = webScraping.validateTimeBets(myBetsOpen);

            if(validatedBets.length > 0){
                const newBets = await webScraping.verifyNewBets(validatedBets, this.#bets);

                if(Array.isArray(newBets) && newBets.length > 0 ){
                    const bets = await webScraping.validationGames(newBets);
                    bets.forEach(async ({idJogo, openBet}) => {
                        const market = await euroBetsService.getGameOptions(idJogo, openBet);
                        await euroBetsService.registerBet(market.id, idJogo);
                        await euroBetsService.finishBet(openBet, this.#multiplybet);
                    })
                }


                if (Array.isArray(newBets) && newBets.length > 0) {
                    const msg = await message.templateMessage(newBets)
                    telegramService.sendMessage(this.#groupId, msg)
                    .then((success) => logger('[SUCCESS] send message group telegram', `Response: ${success}`))
                    .catch((err) => logger('[ERROR] send message group telegram', `Error: ${err}`));
                }

                this.#bets.push(...newBets);
            }
            logger('[END] [WebAutomation] start()', `Bets: ${JSON.stringify(this.#bets, null, "\t")}`)
            // timer aleatório
        }, 10000)
    }
}

module.exports = WebAutomation;
