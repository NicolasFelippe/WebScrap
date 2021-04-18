const axios = require('axios');
const cmd = require('../util/cmd')

const getUsers = (_) => {
    return ['sabrinamello'];
}

const replyBets = (users, idMatch, betId) => {
    for(user of users){
        cmd.execute(`cd ..\\replyBets && npm run start user=${user} idMatch=${idMatch} idBet=${betId}`)
    }
}


module.exports = {getUsers, replyBets}