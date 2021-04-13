const axios = require('axios');

const getOptions = (headers, dataMatch) => {
    const config = {
        method: 'get',
        url: `https://www.eurobets.uk/api/getOptions/${dataMatch}`,
        withCredentials: true,
        headers: {
            cookie: headers['set-cookie']
        }
    };
    return axios(config)
        .then(({ data }) => data)
}

const clearAll = (headers) => {
    const config = {
        method: 'get',
        url: 'https://www.eurobets.uk/api/addBet?clear=all',
        withCredentials: true,
        headers: {
            cookie: headers['set-cookie']
        }
    }
    return axios(config)
        .then(({ data }) => data)
        .catch((error) => {
            throw `[asdasd]${error}`
        })
}

const addBet = (headers, idJogo, apostaId) => {
    console.log('url', `https://www.eurobets.uk/api/addBet?match=${idJogo}&choice=${apostaId}`)
    const config = {
        method: 'get',
        url: `https://www.eurobets.uk/api/addBet?match=${idJogo}&choice=${apostaId}`,
        withCredentials: true,
        headers: {
            cookie: headers['set-cookie']
        }
    };

    return axios(config)
        .then(({ data }) => data)
}

const finishBet = (headers, data) => {
    const config = {
        method: 'POST',
        url: `https://www.eurobets.uk/api/finishBet`,
        withCredentials: true,
        headers: {
            cookie: headers['set-cookie'],
            ...data.getHeaders()
        },
        data
    };

    return axios(config)
        .then(({ data }) => data)
}

module.exports = { getOptions, clearAll, addBet, finishBet }