const dotenv = require('dotenv').config()
const EuroBetsService = require('../api/services/EuroBetsService')
const WebScrapingService = require('../api/services/WebScrapingService')
const VenomBotService = require('../api/services/VenomBotService')
const venom = require('venom-bot');

class Main {

    constructor() {

    }

    async start() {
        if (dotenv.error) {
            console.debug(error)
        }

        

        /* const client = await venom.create()
        client.onMessage((message) => {
            client
                .sendText(message.from, 'Olá! Teste de robo')
                .then((result) => {
                    console.log('Result: ', result); //retorna um objeto de successo
                })
                .catch((erro) => {
                    console.error('Erro ao enviar mensagem: ', erro); //return um objeto de erro
                });

        }); */

        const { USER, PASS } = dotenv.parsed

        const euroBetsService = new EuroBetsService(USER, PASS);

        const headers = await euroBetsService.login();

        const webScraping = new WebScrapingService(headers)

        const myBetsOpen = await webScraping.getScrapBets()

        const validatedBets = webScraping.validateBets(myBetsOpen);

        

        //const validation = await webScraping.validationGames(myBetsOpen)
        // junior 554797172810
        // nicolas 554796782448


        /* const message = await this.message(myBeatsOpen)
        console.log(message)
        await client.sendText('554797172810@c.us', message).then((success) => console.log('mensagem enviada')) */


    }
    async message(myBeatsOpen) {
        try {
            let message = 'Bom dia seu pau no cu do caralho! Teu robo de merda fez essas aposta agora pouco:\n\r '
            console.log(myBeatsOpen)
            message += myBeatsOpen.map((beat, index) => (
            `Aposta ${index + 1}:
            Time Casa: ${beat.timeCasa},
            Time Visitante: ${beat.timeVisitante},
            Data Jogo: ${beat.dataJogo},
            Hora Jogo: ${beat.horaJogo},
            Valor Aposta: ${beat.valorAposta},
            Data: ${beat.data},
            Hora: ${beat.hora}
            \n\r`))

            return message
        } catch (error) {
            console.log('erro ao montar mensagem', error)
        }

    }
}

module.exports = new Main();
