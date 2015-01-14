var winston = require('winston');
var path = require('path');
var mkdirp = require('mkdirp');

// init log folder now ...Will create if one does not exist already
var log_folder = path.normalize(__dirname+"/../logs");
mkdirp.sync(log_folder);

var log_file=path.normalize(log_folder+"/catalyst.log");
//console.log("Log file dir name = "+ log_folder);
//console.log("Log file  = "+ log_file);

winston.emitErrs = true;

/**
 * This is the logger used for logging application level logs
 */
var logger = new winston.Logger({
    transports: [
        new winston.transports.DailyRotateFile({
            level: 'info',
            datePattern: '.yyyy-MM-dd',
            filename: 'catalyst.log',
            dirname:log_folder,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true,
            timestamp:true
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;

//module.exports.logger = logger;
// when we use winston to log chef client runs, ssh logs, docker logs etc, we will use this
// module.exports.catlogger = ??

module.exports.stream = {
    write: function(message, encoding){
        appLogger.info(message);
    }
};