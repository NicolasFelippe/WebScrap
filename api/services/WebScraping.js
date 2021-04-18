const { addBet, finishBet, getJsonCoupon } = require('./eurobets-service')
const FormData = require('form-data');
const { logger, JsonToString } = require('../util/utils');

class WebScrapingService {
    #headers
    constructor(headers) {
        this.#headers = headers
    }


    async validationGames(BETVALUE, dataMatch, apostaId) {
        logger('[INIT] [WebScrapingService] validationGames()')
        const betsFinish = []
        try {
            

            const betsCounpon = await getJsonCoupon(this.#headers);
            console.log('getJsonCoupon', betsCounpon)

            let betsCoupon = Object.values(betsCounpon).filter((bet) => bet.match_id && bet.nome)
            console.log('betscoupon filter', betsCoupon.length)
            let count = 1
            if (betsCoupon.length === 0) {
                const betFinish = await this.addAndFinishBet(dataMatch, apostaId, BETVALUE, count)
                betsFinish.push(betFinish)
            } else {
                for (let betCoupon of betsCoupon) {
                    const betFinish = await this.addAndFinishBet(betCoupon.match_id, betCoupon.opcao_id, BETVALUE, count)
                    betsFinish.push(betFinish)
                }
            }
        } catch (error) {
            logger(error)
            return null
        } finally {
            logger('[END] [WebScrapingService] validationGames()', `betFinish : ${JsonToString(betsFinish)}`)
            return betsFinish
        }
    }

    async addAndFinishBet(dataMatch, apostaId,  BETVALUE, count) {
        logger('[INIT] [WebScrapingService] addAndFinishBet()', `dataMatch: ${JsonToString(dataMatch)}`,
            `apostaId: ${JsonToString(apostaId)}`, `valorAposta: ${JsonToString(BETVALUE)}`)
        try {
            const betAdded = await addBet(this.#headers, dataMatch, apostaId)
            console.log('betAdded', betAdded)

            console.log("BETVALUE: ", BETVALUE)
            const value = Number.parseInt(BETVALUE).toFixed(2).replace('.', ',')
            const data = new FormData();
            data.append('valor', value);

            const betFinish = await finishBet(this.#headers, data)
            console.log('betFinish', betFinish)
            if (count <= 6 && betFinish.status !== 1 && !betFinish.codigo && !betFinish.credito) {
                await this.addAndFinishBet(dataMatch, apostaId, BETVALUE, count)
                count++
                logger('[TENTATIVAS] [WebScrapingService] addAndFinishBet()', `TENTATIVAS: ${count}`)
            } else {
                logger('[END] [WebScrapingService] addAndFinishBet()', `finishBet: ${JsonToString(betFinish)}`, `Tentativas: ${count}`)
            }
            return {
                betFinish,
                tentativas: count
            }

        } catch (error) {
            logger(error)
            return
        }
    }
}
module.exports = WebScrapingService;