var winston = require('winston');
var path = require('path');
var mkdirp = require('mkdirp');

// init log folder now ...Will create if one does not exist already
var log_folder = path.normalize(__dirname+"/../logs");
mkdirp.sync(log_folder);

winston.emitErrs = true;

////////
/**
 * This is the single logger used for logging application level logs
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
            name:'cat-file-log'
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            name:'cat-console'
        })
    ],
    exitOnError: false
});

/**
 * This is how application level loggers are created in a specific module.
 * This method is more efficient than returning one logger for each module.
 *
 * var logger = require('./lib/logger')(module);
 *
 * @param module - The the calling module.
 */
function create_logger(calling_module){
    if(! calling_module.filename ){
        throw new Error("Expecting a valid module object.Got this instead >> "+ calling_module);
    }

    // We will modify the args we send to logger's log methods.
    // We want the file name as part of the logs !!
    function change_args(args){
        var label = "[" + path.basename(calling_module.filename) + "] ";
        args[0]=label+args[0];
        return args
    }

    return {
        info: function(msg){logger.info.apply(logger, change_args(arguments));}, 
        debug: function(msg){logger.debug.apply(logger, change_args(arguments));}, 
        warn: function(msg, vars){logger.warn.apply(logger, change_args(arguments));}, 
        error: function(msg, vars){logger.error.apply(logger, change_args(arguments));}, 
        log: function(msg, vars){logger.log.apply(logger, change_args(arguments));}
    }
    
};// end create_logger

/**
 * Used to log Express Logs.Not to be used for anything else !!!!
 */
function create_express_logger(){

    var logger = new winston.Logger({
        transports: [
            new winston.transports.DailyRotateFile({
                level: 'debug',
                datePattern: '.yyyy-MM-dd',
                filename: 'access.log',
                dirname:log_folder,
                handleExceptions: true,
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: true,
                timestamp:true,
                name:'express-file-log',
                label:"Express"
            })
        ],
        exitOnError: false
    });

    return logger;
};// end create_express_logger

//  
/**
 * Used to log logs from instances nodes, docker containers to logstash/ELK
 * Logs.Not to be used for anything else !!!!
 */
function create_instance_logger(){
    // will make 
    require('winston-logstash');

    var logger = new winston.Logger({
        transports: [
            new winston.transports.Logstash({
                port: 28777,
                node_name: 'my node name',
                host: '127.0.0.1'
            })
        ],
        exitOnError: false
    });

    return logger;
};// end create_express_logger


module.exports = create_logger;
module.exports.ExpressLogger = create_express_logger;