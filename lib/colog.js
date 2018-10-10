const winston = require('winston');

const fileHandle = function (filename, options) {
    const default_options = {
        json: false,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
    };
    const cfg = Object.assign({}, default_options, options, {filename});
    return new winston.transports.File(cfg);
};

const console_handle = new winston.transports.Console({
    json: false,
    timestamp: true
});

// levels = {error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5}
const Logger = (level, logfile, options) => {
    if (!logfile) {
        logfile = `_${level}.log`
    } else {
        if (!logfile.endsWith('.log')) {
            logfile += '.log'
        }
    }
    const file_handle = fileHandle(logfile, options);
    const logger = new winston.Logger({
        level: level,
        transports: [console_handle, file_handle]
    });
    logger.config = {level, logfile};
    return logger;
};

const bindConsole = (logger) => {
    const levels = ["error", "info", "debug", "warn"];
    for (let level of levels) {
        console[level] = logger[level]
    }
    console.log = (...args) => logger.info(...args);
};

module.exports = {
    Logger: Logger,
    bindConsole: bindConsole,
};
