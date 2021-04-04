const rp = require('request-promise');
const cheerio = require('cheerio');
const { logger } = require('../util/util')

class WebScrapingService {
    #headers
    constructor(headers) {
        this.#headers = headers
    }

    async getScrapBets() {
        logger('[INIT] [WebScrapingService] getScrapBets()')
        const bets = []
        try {
            const options = {
                uri: 'https://www.eurobetsplus.com/sportsbook/my-bets',
                headers: {
                    cookie: this.#headers['set-cookie']
                },
                transform: (body) => {
                    return cheerio.load(body)
                }
            }

            await rp(options)
                .then(async ($) => {
                    await $('#accordion').children().each((i, item) => {
                        if ($(item).find(`#heading${i + 1} > span`).text().includes('Aberto')) {
                            // pega dt e hora do bilhete
                            const [data, hora] = $(item).find(`#collapse${i + 1} > div > div > div:nth-child(1)`).text().split(' ')
                            const [timeCasa, timeVisitante] = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div.mybet_item_title`).text().trim().split('x')
                            const [dataJogo, horaJogo] = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div:nth-child(2)`).text().trim().split(' ')
                            const statusAposta = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div:nth-child(3)`).text().trim()
                            const timeOdd = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div:nth-child(4)`)
                            const [time] = $(timeOdd).text().trim().split($(timeOdd).find('.odd').text())
                            const odd = $(timeOdd).find('.odd').text().trim()
                            const [valor] = $(item).find(`#heading${i + 1}`).text().trim().split('|')
                            const valorAposta = parseFloat(valor.replace('R$', '').replace(',', '.').trim())
                            const bilhete = {
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
                            bets.push(bilhete)
                        }
                    })
                }).catch((err) => {
                    logger('[ERROR] [WebScrapingService] getScrapBets() READ HTML: ', `Error: ${JSON.stringify(err, null, "\t")}`)
                })

            logger('[END] [WebScrapingService] getScrapBets()', `bets: ${JSON.stringify(bets, null, "\t")}`)
            return bets

        } catch (error) {
            logger('[ERROR] [WebScrapingService] getScrapBets(): ', `Error: ${JSON.stringify(error, null, "\t")}`)
            return null
        }
    }

    async validationGames(myBetsOpen) {
        logger('[INIT] [WebScrapingService] validationGames()', `myBetsOpen: ${JSON.stringify(myBetsOpen, null, "\t")}`)
        const bets = []
        try {
            const options = {
                uri: 'https://www.eurobetsplus.com/sportsbook/bet?esporte=futebol',
                headers: {
                    cookie: this.#headers['set-cookie']
                },
                transform: (body) => {
                    return cheerio.load(body)
                }
            }
            await rp(options)
                .then(($) => {
                    $('#section-principal').children().each((index, children) => {
                        $(children).children().each((i, x) => {
                            $(x).children().each((d, table) => {
                                $(table).find('tbody').children().each(async (g, h) => {
                                    if (myBetsOpen.some((x) => $(h).text().trim().includes(x.timeCasa))) {

                                        const idJogo = $(h).text().trim().substring($(h).text().trim().indexOf('ID:')).split(' ')[1]
                                        const openBet = myBetsOpen.find((x) => $(h).text().trim().includes(x.timeCasa))

                                        bets.push({ idJogo, openBet });
                                    }
                                })
                            })
                        })
                    })
                }).catch((error) => {
                    logger('[ERROR] [WebScrapingService] validationGames() READ HTML: ', `Error: ${JSON.stringify(error, null, "\t")}`)
                })
            logger('[END] [WebScrapingService] validationGames()', `bets: ${JSON.stringify(bets, null, "\t")}`)
            return bets
        } catch (error) {
            logger('[ERROR] [WebScrapingService] validationGames(): ', `Error: ${JSON.stringify(error, null, "\t")}`)
            return null
        }
    }

    validateTimeBets(myBets) {
        logger('[INIT] [WebScrapingService] validateTimeBets()', `myBets: ${JSON.stringify(myBets, null, "\t")}`)
        const validatedBets = myBets.filter((bet) => {
            let hour = bet.horaJogo.substring(0, 5);
            let date = bet.dataJogo.split("/").reverse().join('-');
            let dateBet = new Date(`${date} ${hour}`);
            let currenteData = new Date();

            dateBet = new Date(dateBet.valueOf() - dateBet.getTimezoneOffset() * 60000)
            currenteData = new Date(currenteData.valueOf() - currenteData.getTimezoneOffset() * 60000)

            return currenteData.getTime() < dateBet.getTime();
        })
        logger('[END] [WebScrapingService] validateTimeBets()', `validatedBets: ${JSON.stringify(validatedBets, null, "\t")}`)

        return validatedBets;
    }

    verifyNewBets(validatedBets, bets) {
        logger('[INIT] [WebScrapingService] verifyNewBets()', `validatedBets: ${JSON.stringify(validatedBets, null, "\t")}`,  `bets: ${JSON.stringify(bets, null, "\t")}`)
        const newBets = validatedBets.filter((validatedBet) => {
            return !bets.some((bet) => {
                return bet.timeCasa === validatedBet.timeCasa
                    && bet.timeVisitante === validatedBet.timeVisitante
                    && bet.statusAposta === validatedBet.statusAposta
            });
        })
        logger('[END] [WebScrapingService] verifyNewBets()', `newBets: ${JSON.stringify(newBets, null, "\t")}`)
        return newBets;
    }
}
module.exports = WebScrapingService;