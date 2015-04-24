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
var passport = require('passport');
var passportLdapStrategy = require('./lib/ldapPassportStrategy.js');



var appConfig = require('./config/app_config');

var RedisStore = require('connect-redis')(express);
var MongoStore = require('connect-mongo')(express.session);

var mongoDbConnect = require('./lib/mongodb');


logger.debug('Starting Catalyst');
logger.debug('Logger Initialized');

// setting up up passport authentication strategy


passport.use(new passportLdapStrategy({
    host: appConfig.ldap.host,
    port: appConfig.ldap.port,
    baseDn: appConfig.ldap.baseDn,
    ou: appConfig.ldap.ou,
    usernameField: 'username',
    passwordField: 'pass'
}));

// passport.use(new passportLdapStrategy({
//     host:'192.168.105.11',
//     port: 389,
//     baseDn: 'DC=rlindia,DC=com',
//     ou: '',
//     usernameField: 'username',
//     passwordField: 'pass'
// }));


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

var dboptions = {
    host: appConfig.db.host,
    port: appConfig.db.port,
    dbName: appConfig.db.dbName
};
mongoDbConnect(dboptions, function(err) {
    if (err) {
        logger.error("Unable to connect to mongo db >>" + err);
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
    format: 'dev',
    stream: {
        write: function(message, encoding) {
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

//setting up passport
app.use(passport.initialize());
app.use(passport.session());

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