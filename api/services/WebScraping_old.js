const rp = require('request-promise');
const cheerio = require('cheerio');
const axios = require('axios');
const { getOptions, clearAll, addBet, finishBet } = require('./axios')
const FormData = require('form-data');
const { logger } = require('../util/util');
class WebScrapingService {
    #headers
    constructor(headers) {
        this.#headers = headers
    }

    async getScrapBets() {
        logger('[INIT] [WebScrapingService] getScrapBets()')
        const bilhetes = []
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
                .then(($) => {
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
                }).catch((error) => {
                    logger('[ERROR] [WebScrapingService] getScrapBets() READ HTML: ', `Error: ${JSON.stringify(error, null, "\t")}`)
                })

            logger('[END] [WebScrapingService] getScrapBets()', `Bilhetes novos encontrados: ${JSON.stringify(bilhetes, null, "\t")}`)
            return bilhetes

        } catch (error) {
            logger('[ERROR] [WebScrapingService] getScrapBets() ', `Error: ${JSON.stringify(error, null, "\t")}`)
            return null
        }
    }

    async validationGames(myBetsOpen, multiplyBet) {
        logger('[INIT] [WebScrapingService] validationGames()', `myBetsOpen: ${JSON.stringify(myBetsOpen, null, "\t")}`)
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
            const $ = await rp(options)
                .then(($) => $)
            for (let bet of myBetsOpen) {
                const match = $(`[data-matchname='${bet.match}']`)[0]
                const dataMatch = $(match).attr('data-match');
                console.log('dataMatch', dataMatch)
                if (dataMatch) {
                    const { markets } = await getOptions(this.#headers, dataMatch)
                    const aposta = markets[bet.statusAposta][bet.time.trim()]
                    console.log('aposta', aposta)
                    const clear = await clearAll(this.#headers)
                    console.log('clear', clear)
                    const betAdded = await addBet(this.#headers, dataMatch, aposta.id)
                    console.log('betAdded', betAdded)
                    const value = (Number(bet.valorAposta) * multiplyBet).toFixed(2).replace('.', ',')
                    const data = new FormData();
                    data.append('valor', value);
                    const finishBet2 = await finishBet(this.#headers, data)
                    console.log('finishBet', finishBet2)
                }
            }
        } catch (error) {
            logger('[ERROR] [WebScrapingService] validationGames() ', `Error: ${JSON.stringify(error, null, "\t")}`)
            return null
        } finally {
            logger('[END] [WebScrapingService] validationGames()')
        }

    }

    validateBets(myBets) {
        const validatedBets = myBets.filter((bet) => {
            let hour = bet.horaJogo.substring(0, 5);
            let date = bet.dataJogo.split("/").reverse().join('-');
            let dateBet = new Date(`${date} ${hour}`);
            let currenteData = new Date();

            dateBet = new Date(dateBet.valueOf() - dateBet.getTimezoneOffset() * 60000)
            currenteData = new Date(currenteData.valueOf() - currenteData.getTimezoneOffset())

            // adicionar 10 minutos após o horário do jogo
            return currenteData.getTime() < dateBet.getTime();
        })

        console.log("bets validadas: ", validatedBets);

        return validatedBets;
    }

    verifyNewBets(validatedBets, bets) {
        console.log(validatedBets, bets)
        const newBets = validatedBets.filter((validatedBet) => {
            return !bets.some((bet) => {
                return bet.timeCasa === validatedBet.timeCasa
                    && bet.timeVisitante === validatedBet.timeVisitante
                    && bet.statusAposta === validatedBet.statusAposta
            });
        })

        console.log("bets novas: ", newBets);
        return newBets;
    }
}
module.exports = WebScrapingService;