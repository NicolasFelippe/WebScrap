const axios = require('axios');
const { Console } = require('winston/lib/winston/transports');
const cmd = require('../util/cmd')
const { logger } = require('../util/utils')

const getUsers = () => {
    return [
        {
            login: 'sabrinamello',
            password: 'Belinha22',
            value: 100
        },
        {
            login: 'markkinhos',
            password: 'respeitaodeficiente',
            value: 50
        },
        {
            login: 'SmashHero',
            password: 'fabrines2',
            value: 50
        },
        {
            login: 'andreiSSPACEmuhlmann',
            password: 'Am127@bet',
            value: 50
        },
        {
            login: 'adesoares',
            password: '18121997dd',
            value: 60
        },
        {
            login: 'cristianocord',
            password: 'xpt*747.',
            value: 5
        },
        {
            login: 'juansouza',
            password: 'neo@123',
            value: 2
        },
        {
            login: 'jean.grahl',
            password: 'Jean@123',
            value: 20
        },
        {
            login: 'gralima',
            password: '314159@yleizarg',
            value: 30
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