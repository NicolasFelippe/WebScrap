const axios = require('axios');
const FormData = require('form-data');
const fs = require('../util/fs')
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
                .catch((error) => {
                    console.log(error);
                });

            if (!this.#headers) throw new Error('Headers está nulo')

            return this.#headers

        } catch (error) {
            console.log('error login', error)
        }
    }

    async getGameOptions(idJogo, bet){

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
                console.log('configGetBet error:', error);
            });

        console.log('markets: ', market);
        return market;
    }
   
    async registerBet(marketId, idJogo) {
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
                console.log('configChoice', response.data)
            })
            .catch((error) => {
                console.log('configChoice error:', error);
            });
    }

    async finishBet(bet, MULTIPLYBET) {
        const data = new FormData();
        data.append('valor', (Number(bet.valorAposta) * MULTIPLYBET).toFixed(2).replace('.', ','));

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
                console.log('aposta feita: ', response.data)
            })
            .catch((error) => {
                console.log('configFinish error:', error);
            });
    }
}

module.exports = EuroBetsService;