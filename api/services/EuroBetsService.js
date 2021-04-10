const axios = require('axios');
const FormData = require('form-data');
const { logger } = require('../util/util')
/** EuroBetsService faz login na conta eurobets, e pega os bilhetes  */
class EuroBetsService {
    #user;
    #pass;
    #cookie
    #headers
    /**
    * @param {string} user  - Usuario da Conta 
    * @param {string} pass  - Senha da Conta 
    *
    */
    constructor(user, pass) {
        /** @private */
        this.#user = user;
        /** @private */
        this.#pass = pass;
        /** @private */
        this.#cookie = {
            'Cookie': '__cfduid=d728413df95b87139adab13b5f25d99b91615600722; PHPSESSID=mj1ed6sk0gu4htirfagu862tr2',
        }
        this.#headers = null
    }
    /**
     * Faz login na eurobets e retorna a instancia do axios com os cookies
     */
    async login() {
        try {
            logger('[INIT] [EuroBetsService] login()')
            const data = new FormData();
            data.append('user', this.#user);
            data.append('pass', this.#pass);

            const configAuth = {
                method: 'post',
                url: 'https://www.eurobetsplus.com/api/login',
                withCredentials: true,
                headers: {
                    cookie: this.#cookie,
                    ...data.getHeaders()
                },
                data: data
            };
            // Faz autenticação no site e carrega os cookie no axios para poder usar nas proximas requisições
            await axios(configAuth)
                .then((response) => {
                    // console.log('autenticado na eurobets', response)
                    this.#headers = response.headers
                })
                .catch((err) => {
                    logger('[ERROR] [EuroBetsService] login() ConfigAuth Error: ', `Error: ${JSON.stringify(err, null, "\t")}`)
                });

            if (!this.#headers) throw new Error('Headers está nulo')
            logger('[END] [EuroBetsService] login()', `Headers: Autenticado!`)
            return this.#headers

        } catch (error) {
            logger('[ERROR] [EuroBetsService] login(): ', `Error: ${JSON.stringify(error, null, "\t")}`)
        }
    }

    async getGameOptions(idJogo, bet) {
        logger('[INIT] [EuroBetsService] getGameOptions()', `idJogo: ${idJogo}`, `bet: ${JSON.stringify(bet, null, "\t")}`)
        let market;

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
                market = markets[bet.statusAposta]
                market = market[bet.time.trim()]
            })
            .catch((error) => {
                logger('[ERROR] [EuroBetsService] getGameOptions() configGetBet: ', `Error: ${JSON.stringify(error, null, "\t")}`);
            });
        logger('[END] [EuroBetsService] getGameOptions()', `market: ${JSON.stringify(market, null, "\t")}`)
        return market;
    }

    async registerBet(marketId, idJogo) {
        logger('[INIT] [EuroBetsService] registerBet()', `marketId: ${marketId}`, `idJogo: ${idJogo}`)
        const configChoice = {
            method: 'get',
            url: `https://www.eurobetsplus.com/api/addBet?match=${idJogo}&choice=${marketId}`,
            withCredentials: true,
            headers: {
                cookie: this.#headers['set-cookie']
            }
        };
        await axios(configChoice)
            .then((response) => {
                logger('[END] [EuroBetsService] registerBet()', `registerBet: ${JSON.stringify(response.data, null, "\t")}`)
            })
            .catch((error) => {
                logger('[ERROR] [EuroBetsService] registerBet() configChoice', `Error: ${JSON.stringify(error, null, "\t")}`)
            });
    }

    async finishBet(bet, multiplyBet) {
        const data = new FormData();
        const value = (Number(bet.valorAposta) * multiplyBet).toFixed(2).replace('.', ',')
        data.append('valor', value);
        logger('[INIT] [EuroBetsService] finishBet()', `bet: ${JSON.stringify(bet, null, "\t")}`, `multiplyBet: ${multiplyBet}, valor: ${value}`)
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
                logger('[END] [EuroBetsService] finishBet()', `finishBet: ${JSON.stringify(response.data, null, "\t")}`)
            })
            .catch((error) => {
                logger('[ERROR] [EuroBetsService] finishBet() configFinish',  `Error: ${JSON.stringify(error, null, "\t")}`)
            });
    }
}

module.exports = EuroBetsService;