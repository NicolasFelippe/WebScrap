const axios = require('axios');
const { JsonToString } = require('../util/utils')

const getUsers = (headers, dataMatch) => {
    const config = {
        method: 'get',
        url: 'http://18.228.228.164:3003/api/bet-users',
        withCredentials: true,
        headers: {
            'api-token':'371c1907-fb90-4ac8-814b-7580a2e82380'
        }
    };
    return axios(config)
        .then(({ data }) => data)
        .catch((error) => {
            throw `[ERROR] getOptions ${JsonToString(error)}`
        })
} 


module.exports = { getUsers }