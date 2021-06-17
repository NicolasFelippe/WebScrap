const cmd = require('../util/cmd')
const { logger } = require('../util/utils')

const replyBets = async (users, idMatch, betId, multiplyChild) => {
    for (user of users) {
        logger('[INIT] [Reply Bets] replayBets()', `execucao cmd: ${user.login}, ${idMatch}, ${betId}, ${multiplyChild}, ${user.stake}`)
        cmd.execute(`./processChildren.sh`, user.login, user.password, user.stake * multiplyChild, idMatch, betId, '&')
    }
}

module.exports = { getUsers, replyBets }