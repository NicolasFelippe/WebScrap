const axios = require('axios');
const { Console } = require('winston/lib/winston/transports');
const cmd = require('../util/cmd')
const { logger } = require('../util/utils')

const getUsers = (_) => {
    return [
        {
            login: 'nicolasrocha',
            password: 'Nicolas#123'
        },
        {
            login: 'sabrinamello',
            password: 'Belinha22'
        }
    ];
}

const replyBets = (users, idMatch, betId, multiplyChild) => {
    for (user of users) {
        logger('[INIT] [Reply Bets] replayBets()', `execucao cmd: ${user.login}, ${user.password}, ${idMatch}, ${betId}, ${multiplyChild}`)
        cmd.execute(`./processChildren.sh`, user.login, user.password, idMatch, betId, multiplyChild, '&')
    }
}

module.exports = { getUsers, replyBets }