const axios = require('axios');
const cmd = require('../util/cmd')
const { logger } = require('../util/utils')

const getUsers = (_) => {
    return ['sabrinamello'];
}

const replyBets = async (users, idMatch, betId, multiplyChild) => {
    for(user of users){
        logger('[INIT] [Reply Bets] replyBets()', `execucao cmd: ${user}, ${idMatch}, ${betId}`)
        cmd.execute(`cd ..\\replyBets && start cmd.exe /c npm run start user=${user} idMatch=${idMatch} idBet=${betId} multiply=${multiplyChild} &`)
    }
}


module.exports = {getUsers, replyBets}