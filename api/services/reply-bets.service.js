const axios = require('axios');
const { Console } = require('winston/lib/winston/transports');
const cmd = require('../util/cmd')
const { logger } = require('../util/utils')

const getUsers = () => {
    return [
        {
            login: 'markkinhos',
            password: 'respeitaodeficiente',
            value: 50
        },
        {
            login: 'sabrinamello',
            password: 'Belinha22',
            value: 100
        },
        {
            login: 'SmashHero',
            password: 'fabrines2',
            value: 50
        }
    ];
}

const replyBets = async (users, idMatch, betId, multiplyChild) => {
    for (user of users) {
        logger('[INIT] [Reply Bets] replayBets()', `execucao cmd: ${user.login}, ${idMatch}, ${betId}, ${multiplyChild}, ${user.value}`)
        cmd.execute(`./processChildren.sh`, user.login, user.password, user.value * multiplyChild, idMatch, betId, '&')
    }
}

module.exports = { getUsers, replyBets }