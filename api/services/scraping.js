const rp = require('request-promise');
const cheerio = require('cheerio');

const getSportBookByFutebol = (headers) => {
    const options = {
        uri: 'https://eurobetsplus.com/sportsbook/bet?esporte=futebol&data=2021-08-13',
        headers: {
            cookie: headers['set-cookie']
        },
        transform: (body) => {
            return cheerio.load(body)
        }
    }
    return rp(options)
        .then(($) => $)
        .catch((error) => {
            throw `[ERROR] getSportBookByFutebol ${JsonToString(error)}`
        })
}

const getMyBets = (headers) => {
    const options = {
        uri: 'https://www.eurobetsplus.com/sportsbook/my-bets',
        headers: {
            cookie: headers['set-cookie']
        },
        transform: (body) => {
            return cheerio.load(body)
        }
    }

    return rp(options)
        .then(($) => $)
        .catch((error) => {
            throw `[ERROR] getMyBets ${JsonToString(error)}`
        })
}

module.exports = { getSportBookByFutebol, getMyBets }