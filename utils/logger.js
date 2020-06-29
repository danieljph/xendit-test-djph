const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;
});

// Winston logging configuration.
const options =
{
    fileInfo: {
        level: 'info',
        filename: `${process.env.LOG_LOCATION || `${rootPath}/logs`}/app.log`,
        maxsize: process.env.LOG_MAX_SIZE_BYTES || 204800, // 200 KB
        maxFiles: process.env.LOG_MAX_FILES || 99,
        format: combine(
            label({ label: 'CUSTOM_LABEL' }),
            timestamp(),
            myFormat
        )
    },
    fileError: {
        level: 'error',
        filename: `${process.env.LOG_LOCATION || `${rootPath}/logs`}/error.log`,
        maxsize: process.env.LOG_MAX_SIZE_BYTES || 204800, // 200 KB
        maxFiles: process.env.LOG_MAX_FILES || 99,
        format: combine(
            label({ label: 'CUSTOM_LABEL' }),
            timestamp(),
            myFormat
        )
    },
    console: {
        // Error, Warn, Info, Verbose, Debug, Silly.
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp: true,
        format: combine(
            label({ label: 'CUSTOM_LABEL' }),
            timestamp(),
            myFormat
        )
    }
};

// Setup Winston logging for both file and console.
const logger = createLogger({
    transports: [
        new transports.File(options.fileInfo),
        new transports.File(options.fileError)
    ],
    exitOnError: false, // Do not exit on handled exceptions.
});

/**
 * If we're not in production then log to the 'console' with the format:
 * `${info.level}: ${info.message} JSON.stringify({ ...rest }).`
 */
if(process.env.NODE_ENV!=='production')
{
    logger.add(new transports.Console(options.console));
}

// Stream Morgan log stream (console) to Winston log.
logger.stream = {
    write(message, encoding) {
        // Use the 'info' log level so the output will be picked up by both transports (file and console).
        logger.info(message);
    }
};

module.exports = logger;
