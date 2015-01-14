var express = require("./node_modules/express");
var app = express();
var engine = require("./node_modules/ejs");
var path = require("path");
var http = require("http");
var https = require("https");
var fs = require('fs');
var childProcess = require('child_process');
var io = require('socket.io');
var logger = require('./lib/logger');

logger.debug('Starting Catalyst');
logger.debug('Logger Initialized');

var appConfig = require('./config/app_config');
var RedisStore = require('connect-redis')(express);
var mongoStore = require('connect-mongo')(express.session);

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

app.set('port', process.env.PORT || appConfig.app_run_port);
app.set('sport', appConfig.app_run_secure_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());

logger.debug("Initializing Session store in mongo");
var store = new express.session.MemoryStore;
app.use(express.session({
    secret: 'sessionSekret',
    store: new mongoStore({
        db: appConfig.db.dbName,
        host: appConfig.db.host,
        port: appConfig.db.port
    })
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
io = io.listen(server, {
    log: false
});

server.listen(app.get('port'), function() {
    logger.debug('Express server listening on port ' + app.get('port'));
});