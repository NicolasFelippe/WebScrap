const loggerWiston = require('./logger')

const getRandomNumber = (min, max) => {
    const time = (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
    console.log(`tempo para da próxima chamada: ${time / 1000} segundos`);
    return time;
}

const logger = (func, ...params) => {
    const date = new Date()
    const msg = `${func} Data: ${date.toLocaleDateString()} Hora: ${date.toLocaleTimeString()}
    Parametros=\n ${params.join(', \n\t\t')} \n`  

    loggerWiston.info(msg)
}

module.exports = {
    getRandomNumber,
    logger,
}