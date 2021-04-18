const dotenv = require('dotenv').config();
const WebScrapingService = require('../api/services/WebScraping');
const { login } = require('../api/services/eurobets-service')
const { logger } = require('../api/util/utils');
const { _ } = require('minimist')(process.argv.slice(2));

class Main {
    constructor() {
    }

    async start() {
        if (dotenv.error) {
            console.debug(error);
        }

        console.log("args constructor", _)
        const [ user, dataMatch, apostaId ] = _;
        let betId = apostaId.split("id=")[1]
        console.log("args: ", user, dataMatch, betId)

        console.log("entrou no start com os parâmetros: ", user, dataMatch, betId)
        const { USER, PASS, BETVALUE } = dotenv.parsed;

        let auth = false
        let headers = null
        let countAuth = 1

        try {
            while (!auth) {
                logger('[INIT] [EuroBetsService] login()', `user: ${USER}`)
                headers = await login(USER, PASS);
                if (headers['set-cookie']) {
                    auth = true
                    logger('[END] [EuroBetsService] login()', `headers: AUTENTICADO`, `Tentativas: ${countAuth}`)
                } else {
                    logger('[ERRO] [EuroBetsService] login()', `Tentativas: ${countAuth}`)
                }
                if(countAuth > 4) throw "Não conseguiu logar";
                countAuth++
            }
    
            const webScraping = new WebScrapingService(headers);
    
            const response = await webScraping.validationGames(BETVALUE, dataMatch, betId);
        } catch (error) {
            logger('[ERRO] Login()', error);
        }
    }
}

module.exports = new Main();