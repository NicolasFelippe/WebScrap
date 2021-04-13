const loggerWiston = require('./logger')

const getRandomNumber = (min, max) => {
    const time = (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
    logger(`Tempo para a próxima chamada: ${time / 1000} segundos`);
    return time;
}

const logger = (func, ...params) => {
    const date = new Date()
    const msg = `${func} Data: ${date.toLocaleDateString()} Hora: ${date.toLocaleTimeString()}
    Parametros=\n ${JSON.stringify(params.join(', \n\t\t', null, '\t'))} \n`  
 
    loggerWiston.info(msg)
}

const sleep = (milliseconds) => {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
module.exports = {
    getRandomNumber,
    logger,
    sleep
}