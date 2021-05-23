const { getOptions, addBet, finishBet, getJsonCoupon, clearAllCoupon } = require('./eurobets-service')
const FormData = require('form-data');
const { logger, JsonToString } = require('../util/utils');
const { getSportBookByFutebol, getMyBets } = require('./scraping');
const ReplyBets = require('./reply-bets.service');
class WebScrapingService {
    #headers
    constructor(headers) {
        this.#headers = headers
    }

    async getScrapBets() {
        logger('[INIT] [WebScrapingService] getScrapBets()')
        const bilhetes = []
        try {
            const $ = await getMyBets(this.#headers)
            $('#accordion').children().each((i, item) => {
                if ($(item).find(`#heading${i + 1} > span`).text().includes('Aberto')) {
                    // pega dt e hora do bilhete
                    const [data, hora] = $(item).find(`#collapse${i + 1} > div > div > div:nth-child(1)`).text().split(' ')
                    const match = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div.mybet_item_title`).text().trim()
                    const [timeCasa, timeVisitante] = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div.mybet_item_title`).text().trim().split('x')
                    const [dataJogo, horaJogo] = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div:nth-child(2)`).text().trim().split(' ')
                    const statusAposta = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div:nth-child(3)`).text().trim()
                    const timeOdd = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div:nth-child(4)`)
                    const [time] = $(timeOdd).text().trim().split($(timeOdd).find('.odd').text())
                    const odd = $(timeOdd).find('.odd').text().trim()
                    const [valor] = $(item).find(`#heading${i + 1}`).text().trim().split('|')
                    const valorAposta = parseFloat(valor.replace('R$', '').replace(',', '.').trim())
                    const bilhete = {
                        match,
                        timeCasa: timeCasa.trim(),
                        timeVisitante: timeVisitante.trim(),
                        dataJogo,
                        horaJogo,
                        valorAposta,
                        data,
                        hora,
                        statusAposta,
                        time,
                        odd
                    }
                    bilhetes.push(bilhete)
                }
            })

            logger('[END] [WebScrapingService] getScrapBets()', `Bilhetes novos encontrados: ${JsonToString(bilhetes)}`)
            return bilhetes

        } catch (error) {
            logger(error)
            return null
        }
    }

    async validationGames(myBetsOpen, multiplyBet) {
        logger('[INIT] [WebScrapingService] validationGames()', `myBetsOpen: ${JsonToString(myBetsOpen)}`)
        const betsFinish = []
        let multiplyChild;

        try {
            const $ = await getSportBookByFutebol(this.#headers)
            for (let bet of myBetsOpen) {
                const match = $(`[data-matchname='${bet.match}']`)[0]
                const dataMatch = $(match).attr('data-match');
                if (dataMatch) {
                    const { markets } = await getOptions(this.#headers, dataMatch)
                    const aposta = markets[bet.statusAposta][bet.time.trim()]

                    const betsCounpon = await getJsonCoupon(this.#headers);

                    const clear = await clearAllCoupon(this.#headers)

                    let betsCoupon = Object.values(betsCounpon).filter((bet) => bet.match_id && bet.nome)
                    let count = 1
                    if (betsCoupon.length === 0) {
                        const betFinish = await this.addAndFinishBet(dataMatch, aposta.id, bet, multiplyBet, count)
                        betsFinish.push(betFinish)
                        logger('valor aposta: ', betFinish.bet.valorAposta)
                        multiplyChild = Number(betFinish.bet.valorAposta) > 70 ? 2 : 1;
                    } else {
                        for (let betCoupon of betsCoupon) {
                            const betFinish = await this.addAndFinishBet(betCoupon.match_id, betCoupon.opcao_id, bet, multiplyBet, count)
                            betsFinish.push(betFinish)
                            betFinish.filter(asdsa => asdsad)
                                .map(asdasdasdasd)
                            multiplyChild = Number(betFinish.bet.valorAposta) > 70 ? 2 : 1;
                        }
                    }

                    // const users = ReplyBets.getUsers()
                    // logger("[END] [WebScrapingService] multiplyChild: ", multiplyChild)
                    // await ReplyBets.replyBets(users, dataMatch, aposta.id, multiplyChild);
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

    async addAndFinishBet(dataMatch, apostaId, bet, multiplyBet, count) {
        logger('[INIT] [WebScrapingService] addAndFinishBet()', `dataMatch: ${JsonToString(dataMatch)}`,
            `apostaId: ${JsonToString(apostaId)}`, `valorAposta: ${JsonToString(bet.valorAposta * multiplyBet)}`)
        try {
            const betAdded = await addBet(this.#headers, dataMatch, apostaId)
            const value = (Number(bet.valorAposta) * multiplyBet).toFixed(2).replace('.', ',')
            const data = new FormData();
            data.append('valor', value);
            const betFinish = await finishBet(this.#headers, data)
            if (count <= 6 && betFinish.status !== 1 && !betFinish.codigo && !betFinish.credito) {
                count++
                await this.addAndFinishBet(dataMatch, apostaId, bet, multiplyBet, count)
                logger('[TENTATIVAS] [WebScrapingService] addAndFinishBet()', `TENTATIVAS: ${count}`)
            } else {
                logger('[END] [WebScrapingService] addAndFinishBet()', `finishBet: ${JsonToString(betFinish)}`, `Tentativas: ${count}`)
            }
            return {
                betFinish,
                bet,
                tentativas: count
            }
            // sucesso - {"status":1,"codigo":"LOVRVNHZFR","credito":"5.464,49"}

        } catch (error) {
            logger(error)
            return
        }
    }

    validateBets(myBets) {
        logger('[INIT] [WebScrapingService] validateTimeBets()', `myBets: ${JsonToString(myBets)}`)
        const validatedBets = myBets.filter((bet) => {
            let hour = bet.horaJogo.substring(0, 5);
            let date = bet.dataJogo.split("/").reverse().join('-');
            let dateBet = new Date(`${date} ${hour}`);
            let currenteData = new Date();

            dateBet = new Date(dateBet.valueOf() - dateBet.getTimezoneOffset() * 60000)
            currenteData = new Date(currenteData.valueOf() - currenteData.getTimezoneOffset() * 60000)

            return currenteData.getTime() < (dateBet.getTime() * 600000);
        })
        logger('[END] [WebScrapingService] validateTimeBets()', `validatedBets: ${JsonToString(validatedBets)}`)

        return validatedBets;
    }

    verifyNewBets(validatedBets, bets) {
        const newBets = validatedBets.filter((validatedBet) => {
            return !bets.some((bet) => {
                return bet.timeCasa === validatedBet.timeCasa
                    && bet.timeVisitante === validatedBet.timeVisitante
                    && bet.statusAposta === validatedBet.statusAposta
            });
        })

        return newBets;
    }
}
module.exports = WebScrapingService;