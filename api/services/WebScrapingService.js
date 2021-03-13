const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('../util/fs');
const differenceInHours = require('date-fns/differenceInHours')

class WebScrapingService {
    #headers
    constructor(headers) {
        this.#headers = headers
    }

    async getScrapBets() {
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
                .then(async ($) => {
                    await $('#accordion').children().each((i, item) => {
                        if ($(item).find(`#heading${i + 1} > span`).text().includes('Aberto')) {
                            // pega dt e hora do bilhete
                            const [data, hora] = $(item).find(`#collapse${i + 1} > div > div > div:nth-child(1)`).text().split(' ')
                            const [timeCasa, timeVisitante] = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div.mybet_item_title`).text().trim().split('x')
                            const [dataJogo, horaJogo] = $(item).find(`#collapse${i + 1} > div > div > div.col-12.col-sm-6.mybet_item > div:nth-child(2)`).text().trim().split(' ')
                            const [valor] = $(item).find(`#heading${i + 1}`).text().trim().split('|')
                            const valorAposta = parseFloat(valor.replace('R$', '').replace(',', '.').trim())
                            const bilhete = {
                                timeCasa: timeCasa.trim(),
                                timeVisitante: timeVisitante.trim(),
                                dataJogo,
                                horaJogo,
                                valorAposta,
                                data,
                                hora
                            }

                            bilhetes.push(bilhete)

                        }
                    })
                }).catch((err) => {
                    console.log('getScrapBets error ler arquivo html');
                })

            return bilhetes

        } catch (error) {
            console.log('screaping', error);
            return null
        }
    }

    async validationGames(myBetsOpen) {
        const bilhetes = []
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
            let teste = []
            await rp(options)
                .then(($) => {
                    console.log(myBetsOpen.some((x) => $('#section-principal').find('#matches_table > tbody > tr:nth-child(1) > td:nth-child(2)').text().trim().includes(x.timeCasa)))
                    $('#section-principal').children().each((index, children) => {
                        $(children).children().each((i, x) => {
                            $(x).children().each((d, table) => {
                                $(table).find('tbody').children().each((g, h) => {
                                    if (myBetsOpen.some((x) => $(h).text().trim().includes(x.timeCasa))) {
                                        const arrayBilhete = $(h).text().trim().split(' ')
                                        const idJogo = arrayBilhete[6].trim()
                                        const dataJogo = arrayBilhete[7].trim()
                                        const horaJogo = arrayBilhete[8].trim()
                                        const [diaJ, mesJ, anoJ] = dataJogo.split('/')
                                        const [horaJ, minutosJ] = horaJogo.split(':')

                                        const bilhete = myBetsOpen.find((x) => $(h).text().trim().includes(x.timeCasa))
                                        const [diaB, mesB, anoB] = bilhete.data.split('/')
                                        const [horaB, minutosB] = bilhete.hora.split(':')

                                        console.log(idJogo, dataJogo, horaJogo, bilhete, arrayBilhete)
                                        console.log(differenceInHours(
                                            new Date(diaJ, mesJ, anoJ, horaJ, minutosJ),
                                            new Date(diaB, mesB, anoB, horaB, minutosB)
                                        ))
                                        let data = new Date();
                                        console.log(differenceInHours(
                                            new Date(data.valueOf() - data.getTimezoneOffset() * 60000),
                                            new Date(diaJ, mesJ, anoJ, horaJ, minutosJ)
                                        ))
                                        console.log(new Date(data.valueOf() - data.getTimezoneOffset() * 60000))
                                    }
                                })
                            })
                        })

                    })
                    // console.log(teste)
                }).catch((err) => {
                    console.log(err);
                })

            return bilhetes
        } catch (error) {
            console.log('screaping', error);
            return null
        }
    }

    validateBets(myBets) {
        console.log("bets: ", myBets);
        const validatedBets = myBets.filter((bet) => {
            let hour = bet.horaJogo.substring(0, 5);
            let date = bet.dataJogo.split("/").reverse().join('-');
            let dateBet = new Date(`${date} ${hour}`);
            let currenteData = new Date();

            dateBet = new Date(dateBet.valueOf() - dateBet.getTimezoneOffset() * 60000)
            currenteData = new Date(currenteData.valueOf() - currenteData.getTimezoneOffset() * 60000)

            console.log("databet: ", dateBet);
            console.log("data atual: ", currenteData)

            return currenteData.getTime() < dateBet.getTime();
        })

        console.log("bets validadas: ", validatedBets);

        return validatedBets;
    }
}
module.exports = WebScrapingService;