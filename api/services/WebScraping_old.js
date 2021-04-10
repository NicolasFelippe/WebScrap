const rp = require('request-promise');
const cheerio = require('cheerio');
const axios = require('axios');
const FormData = require('form-data');

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
                            bilhetes.push(bilhete)

                        }
                    })
                }).catch((err) => {
                    console.log('getScrapBets error ler arquivo html', err);
                })

            return bilhetes

        } catch (error) {
            console.log('screaping', error);
            return null
        }
    }

    async validationGames(myBetsOpen) {
        const bilhetes = []
        let aposta
        try {
            const options = {
                // uri: 'https://www.eurobetsplus.com/sportsbook/bet?esporte=futebol',
                uri: 'https://www.eurobetsplus.com/sportsbook/bet?esporte=futebol&data=2021-03-30',
                headers: {
                    cookie: this.#headers['set-cookie']
                },
                transform: (body) => {
                    return cheerio.load(body)
                }
            }
            console.log('mybets', myBetsOpen)
            await rp(options)
                .then(($) => {
                    console.log(myBetsOpen.some((x) => $('#section-principal')
                        .find('#matches_table > tbody > tr:nth-child(1) > td:nth-child(2)')
                        .text().trim().includes(x.timeCasa)))

                    $('#section-principal').children().each((index, children) => {
                        $(children).children().each((i, x) => {
                            $(x).children().each((d, table) => {
                                $(table).find('tbody').children().each(async (g, h) => {
                                    if (myBetsOpen.some((x) => $(h).text().trim().includes(x.timeCasa))) {
                                        const idJogo = $(h).text().trim().substring($(h).text().trim().indexOf('ID:')).split(' ')[1]
                                        const bilhete = myBetsOpen.find((x) => $(h).text().trim().includes(x.timeCasa))
                                        const configGetBet = {
                                            method: 'get',
                                            url: `https://www.eurobetsplus.com/api/getOptions/${idJogo}`,
                                            withCredentials: true,
                                            headers: {
                                                cookie: this.#headers['set-cookie']
                                            }
                                        };

                                        await axios(configGetBet)
                                            .then((response) => {
                                                const { markets } = response.data
                                                aposta = markets[bilhete.statusAposta]
                                                aposta = aposta[bilhete.time.trim()]
                                            })
                                            .catch((error) => {
                                                console.log('configGetBet error:', error);
                                            });

                                        console.log('markets', aposta)

                                        const configChoice = {
                                            method: 'get',
                                            url: `https://www.eurobetsplus.com/api/addBet?match=${idJogo}&choice=${aposta.id}`,
                                            withCredentials: true,
                                            headers: {
                                                cookie: this.#headers['set-cookie']
                                            }
                                        };
                                        await axios(configChoice)
                                            .then((response) => {
                                                console.log('configChoice', response.data)
                                            })
                                            .catch((error) => {
                                                console.log('configChoice error:', error);
                                            });

                                        const data = new FormData();
                                        data.append('valor', bilhete.valorAposta.toFixed(2).replace('.', ','));

                                        const configFinish = {
                                            method: 'POST',
                                            url: `https://www.eurobetsplus.com/api/finishBet`,
                                            withCredentials: true,
                                            headers: {
                                                cookie: this.#headers['set-cookie'],
                                                ...data.getHeaders()
                                            },
                                            data: data
                                        };
                                        await axios(configFinish)
                                            .then((response) => {
                                                console.log('configFinish', response.data)
                                            })
                                            .catch((error) => {
                                                console.log('configFinish error:', error);
                                            });
                                    }
                                })
                            })
                        })
                    })
                }).catch((err) => {
                    console.log('error games', err);
                })

            return bilhetes
        } catch (error) {
            console.log('screaping', error);
            return null
        }
    }

    validateBets(myBets) {
        const validatedBets = myBets.filter((bet) => {
            let hour = bet.horaJogo.substring(0, 5);
            let date = bet.dataJogo.split("/").reverse().join('-');
            let dateBet = new Date(`${date} ${hour}`);
            let currenteData = new Date();

            dateBet = new Date(dateBet.valueOf() - dateBet.getTimezoneOffset() * 60000)
            currenteData = new Date(currenteData.valueOf() - currenteData.getTimezoneOffset() * 60000)

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