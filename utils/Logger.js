const winston = require('winston'); // for transports.Console
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
    	new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'console.log' })
    ]
});

// silent = true turn off log
logger.transports.forEach((t) => (t.silent = false));
module.exports = logger;