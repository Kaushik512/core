var winston = require('winston');
var path = require('path');
var mkdirp = require('mkdirp');
var util = require('util');

// init log folder now ...Will create if one does not exist already
var log_folder = path.normalize(__dirname+"/../logs");
mkdirp.sync(log_folder);

var log_file=path.normalize(log_folder+"/catalyst.log");

winston.emitErrs = true;

/**
 * This is how loggers are created in a specific module
 *
 * var logger = require('./lib/logger')(module);
 *
 * @param module - The the calling module.
 */
function create_logger(module){
    if(! module.filename ){
        throw new Error("Expecting a vali module object.GOt this instead >> "+ module);
    }
    var label = path.basename(module.filename);

    /**
     * This is the logger used for logging application level logs
     */
    var logger = new winston.Logger({
        transports: [
            new winston.transports.DailyRotateFile({
                level: 'debug',
                datePattern: '.yyyy-MM-dd',
                filename: 'catalyst.log',
                dirname:log_folder,
                handleExceptions: true,
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: true,
                timestamp:true,
                name:'cat-file-log',
                label:label
            }),
            new winston.transports.Console({
                level: 'debug',
                handleExceptions: true,
                json: false,
                colorize: true,
                name:'cat-console',
                label:label
            })
        ],
        exitOnError: false
    });

    return logger;
};// end create_logger


module.exports = create_logger;
module.exports.stream = {
    write: function(message, encoding){
        appLogger.info(message);
    }
};