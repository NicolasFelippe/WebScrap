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
    // /**
    //  * Retorna o html da página de bilhetes
    //  * @const {string} html - Retorno
    //  */
    // async getBets() {
    //     try {
    //         const configGetBets = {
    //             method: 'get',
    //             withCredentials: true,
    //             url: 'https://www.eurobetsplus.com/sportsbook/my-bets',
    //             headers: {
    //                 cookie: this.#headers['set-cookie']
    //             }
    //         };

    //         let html = null;
    //         await axios(configGetBets)
    //             .then((response) => {
    //                 html = response.data
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });

    //         const path = fs.writeFile(html)

    //         return path;

    //     } catch (error) {
    //         console.log('error getBets', error)
    //     }

    // }

    // async getGames() {
    //     try {
    //         const configGetBets = {
    //             method: 'get',
    //             withCredentials: true,
    //             url: 'https://www.eurobetsplus.com/sportsbook/bet?esporte=futebol',
    //             headers: {
    //                 cookie: this.#headers['set-cookie']
    //             }
    //         };

    //         let html = null;
    //         await axios(configGetBets)
    //             .then((response) => {
    //                 html = response.data
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });

    //         const path = fs.writeFile(html)

    //         return path;

    //     } catch (error) {
    //         console.log('error getBets', error)
    //     }

    // }


}

module.exports = EuroBetsService;