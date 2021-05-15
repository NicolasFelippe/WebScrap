const { Worker, isMainThread } = require('worker_threads')

const worker = (users, dataMatch, betId, multiplyChild) => {
    const final = []
    let finishedWorkers = 0
    if (isMainThread) {
        for (let payload of users) {
            payload.value = payload.value * multiplyChild
            console.log('teste', )
            const worker = new Worker('./workers/reply-bet.js', { env: { COOKIE: process.env.COOKIE, DATA_MATCH: dataMatch, BET_ID: betId  } })
            worker.once('message', (response) => {
                final.push(response)
                finishedWorkers++
                if (finishedWorkers === users.length) console.log(final)
            })
            worker.on('error', console.error)

            console.log(`Iniciando loginWorker de ID ${worker.threadId} e enviando o payload "${payload}"`)
            worker.postMessage(payload)
        }
    }

}

module.exports = {
    worker
}