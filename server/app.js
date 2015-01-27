var express = require("./node_modules/express");
var app = express();
var engine = require("./node_modules/ejs");
var path = require("path");
var http = require("http");
var https = require("https");
var fs = require('fs');
var childProcess = require('child_process');
var io = require('socket.io');
var logger = require('./lib/logger')(module);
var expressLogger = require('./lib/logger').ExpressLogger();

logger.debug('Starting Catalyst');
logger.debug('Logger Initialized');

var appConfig = require('./config/app_config');

var RedisStore = require('connect-redis')(express);
var MongoStore = require('connect-mongo')(express.session);

var mongoDbConnect = require('./lib/mongodb');
var dboptions = {
    host: appConfig.db.host,
    port: appConfig.db.port,
    dbName: appConfig.db.dbName
};
mongoDbConnect(dboptions, function(err) {
    if (err) {
        logger.error("Unable to connect to mongo db >>"+ err);
        throw new Error(err);
    } else {
        logger.debug('connected to mongodb - host = %s, port = %s, database = %s', dboptions.host, dboptions.port, dboptions.dbName);
    }
});

var mongoStore = new MongoStore({
    db: appConfig.db.dbName,
    host: appConfig.db.host,
    port: appConfig.db.port
});

app.set('port', process.env.PORT || appConfig.app_run_port);
app.set('sport', appConfig.app_run_secure_port);

app.use(express.compress());
app.use(express.favicon());
app.use(express.logger({
    format:'dev', 
    stream: {
        write: function(message, encoding){
            expressLogger.debug(message);
        }
    }
}));
app.use(express.cookieParser());

logger.debug("Initializing Session store in mongo");

app.use(express.session({
    secret: 'sessionSekret',
    store: mongoStore
}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var options = {
    key: fs.readFileSync('rlcatalyst.key'),
    cert: fs.readFileSync('rlcatalyst.cert'),
    requestCert: true,
    rejectUnauthorized: false
}

logger.debug('Setting up application routes');
var routes = require('./routes/routes.js');
routes.setRoutes(app);

var server = http.createServer(app);

// setting up socket.io
io = io.listen(server, {
    log: false
});

var socketIORoutes = require('./routes/socket.io/routes.js');
socketIORoutes.setRoutes(io);

// checking authorization for socket.io
/*
io.set('authorization', function(data, callback) {
    console.log('socket data ==>',data);
    
});*/


server.listen(app.get('port'), function() {
    logger.debug('Express server listening on port ' + app.get('port'));
});