const getRandomNumber = (min, max) => {
    const time = (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
    console.log(`tempo para da próxima chamada: ${time/1000} segundos`);
    return time;
}

module.exports = {
    getRandomNumber,
}