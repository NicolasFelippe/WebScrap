const { parentPort } = require('worker_threads')
const { authenticate } = require('../api/services/eurobets-service')
const WebScrapingChildrenService = require('../api/services/web-scraping-children')


parentPort.once('message', async (message) => {

    const { login, password, value } = message

    const headers = await authenticate(login, password, process.env.COOKIE);

    const webScraping = new WebScrapingChildrenService(headers);

    const response = await webScraping.validationGamesChildren(value, process.env.DATA_MATCH, process.env.BET_ID);

    parentPort.postMessage(response)
})