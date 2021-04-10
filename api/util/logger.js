const winston = require('winston');
const date = new Date()
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.printf(
            info => {
                let message = info.message.substr(0 ,info.message.indexOf('Parametros='))
                let params = info.message.substr(info.message.indexOf('Parametros='))
                params = params.substr('Parametros='.length)
                return "{\r\n" +
                    `\tlevel: "${info.level.toUpperCase()}",\r\n` +
                    `\tmessage: "${message.trim()}",\r\n` +
                    `\tparams: [{\r\n\t\t${params.trim()}\r\n\t\t}],\r\n},`
            }
        )
    ),
    transports: [
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: `${date.toLocaleDateString().split('/').join('-')}.log` }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;