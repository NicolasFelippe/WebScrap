const axios = require('axios');
const FormData = require('form-data');
const { JsonToString } = require('../util/utils')

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
        .catch((error) => {
            throw `[ERROR] getOptions ${JsonToString(error)}`
        })
} 

const login = (user, pass, envCookie) => {
    const data = new FormData();
    data.append('user', user);
    data.append('pass', pass);
    cookie = {
        'Cookie': envCookie,
    }
    const config = {
        method: 'post',
        url: 'https://www.eurobetsplus.com/api/login',
        withCredentials: true,
        headers: {
            cookie,
            ...data.getHeaders()
        },
        data: data
    };

    return axios(config)
        .then(({ headers }) => headers)
        .catch((error) => {
            throw `[ERROR] login ${JsonToString(error)}`
        })
} 

const clearByMatch = (headers, dataMatch) => {
    const config = {
        method: 'get',
        url: `https://www.eurobets.uk/api/addBet?clear=${dataMatch}`,
        withCredentials: true,
        headers: {
            cookie: headers['set-cookie']
        }
    }
    return axios(config)
        .then(({ data }) => data)
        .catch((error) => {
            throw `[ERROR] clearByMatch ${JsonToString(error)}`
        })
}

const clearAllCoupon = (headers) => {
    const config = {
        method: 'get',
        url: `https://www.eurobets.uk/api/addBet?clear=all`,
        withCredentials: true,
        headers: {
            cookie: headers['set-cookie']
        }
    }
    return axios(config)
        .then(({ data }) => data)
        .catch((error) => {
            throw `[ERROR] clearAllCoupon ${JsonToString(error)}`
        })
}

const addBet = (headers, idJogo, apostaId) => {
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
        .catch((error) => {
            throw `[ERROR] addBet ${JsonToString(error)}`
        })
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
        .catch((error) => {
            throw `[ERROR] finishBet ${JsonToString(error)}`
        })
}

const getJsonCoupon = (headers) => {
    const config = {
        method: 'GET',
        url: `https://www.eurobets.uk/api/getJSONCoupon`,
        withCredentials: true,
        headers: {
            cookie: headers['set-cookie']
        },
    }
    return axios(config)
        .then(({ data }) => data)
        .catch((error) => {
            throw `[ERROR] getJsonCoupon ${JsonToString(error)}`
        })
}

module.exports = { getOptions, clearByMatch, addBet, finishBet, getJsonCoupon, clearAllCoupon, login }