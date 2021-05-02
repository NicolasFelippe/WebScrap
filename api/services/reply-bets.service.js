const axios = require('axios');
const { Console } = require('winston/lib/winston/transports');
const cmd = require('../util/cmd')
const { logger } = require('../util/utils')

const getUsers = (_) => {
    return [
        {
            login: 'nicolasrocha',
            password: 'Nicolas#123',
            value: 250
        },
        {
            login: 'sabrinamello',
            password: 'Belinha22',
            value: 70
        }
    ];
}

const replyBets = (users, idMatch, betId, multiplyChild) => {
    for (user of users) {
        logger('[INIT] [Reply Bets] replayBets()', `execucao cmd: ${user.login}, ${user.password}, ${idMatch}, ${betId}, ${multiplyChild}, ${user.value}`)
        cmd.execute(`./processChildren.sh`, user.login, user.password, user.value * multiplyChild, idMatch, betId, '&')
    }
}

module.exports = { getUsers, replyBets }