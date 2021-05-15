const { addBet, finishBet, getJsonCoupon } = require('./eurobets-service')
const FormData = require('form-data');
const { logger, JsonToString } = require('../util/utils');

class WebScrapingChildrenService {
    
    #headers
    constructor(headers) {
        this.#headers = headers
    }

    async validationGamesChildren(valorAposta, dataMatch, apostaId) {
        logger('[INIT] [REPLY BETS] validationGames()')
        const betsFinish = []
        try {
            const betsCounpon = await getJsonCoupon(this.#headers);
            let betsCoupon = Object.values(betsCounpon).filter((bet) => bet.match_id && bet.nome)
            let count = 1
            if (betsCoupon.length === 0) {
                const betFinish = await this.addAndFinishBet(dataMatch, apostaId, valorAposta, count)
                betsFinish.push(betFinish)
            }
        } catch (error) {
            logger(error)
            return null
        } finally {
            logger('[END] [REPLY BETS] validationGames()', `betFinish : ${JsonToString(betsFinish)}`)
            return betsFinish
        }
    }

    async addAndFinishBet(dataMatch, apostaId,  valorAposta, count) {
        logger('[INIT] [REPLY BETS] addAndFinishBet()', `dataMatch: ${JsonToString(dataMatch)}`,
            `apostaId: ${JsonToString(apostaId)}`, `valorAposta: ${JsonToString(valorAposta)}`)
        try {
            await addBet(this.#headers, dataMatch, apostaId)
            const value = Number(valorAposta).toFixed(2).replace('.', ',');
            const data = new FormData();
            data.append('valor', value);

            const betFinish = await finishBet(this.#headers, data)

            if(typeof betFinish == "string" && betFinish.includes("Créditos insuficientes")){
                throw betFinish;
            }

            if (count <= 6 && betFinish.status !== 1 && !betFinish.codigo && !betFinish.credito) {
                count++
                await this.addAndFinishBet(dataMatch, apostaId, valorAposta, count)
                logger('[TENTATIVAS] [REPLY BETS] addAndFinishBet()', `TENTATIVAS: ${count}`)
            } else {
                logger('[END] [REPLY BETS] addAndFinishBet()', `finishBet: ${JsonToString(betFinish)}`, `Tentativas: ${count}`)
            }
            return {
                betFinish,
                tentativas: count
            }

        } catch (error) {
            logger(error)
            return error;
        }
    }
}
module.exports = WebScrapingChildrenService;