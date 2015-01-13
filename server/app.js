var express = require("./node_modules/express");
var app = express();
var engine = require("./node_modules/ejs");
var path = require("path");
var http = require("http");
var https = require("https");
var fs = require('fs');
var childProcess = require('child_process');
var io = require('socket.io');


var appConfig = require('./config/app_config');

//var cookieParser = express.cookieParser(COOKIE_SECRET);
//var sessionStore = new express.session.MemoryStore();



var RedisStore = require('connect-redis')(express);
var MongoStore = require('connect-mongo')(express.session);


var mongoDbConnect = require('./lib/mongodb');
mongoDbConnect({
    host: appConfig.db.host,
    port: appConfig.db.port,
    dbName: appConfig.db.dbName
}, function(err) {
    if (err) {
        throw new Error(err);
    } else {
        console.log('connected to mongodb');
    }
});

var mongoStore = new MongoStore({
    db: appConfig.db.dbName,
    host: appConfig.db.host,
    port: appConfig.db.port
});



app.set('port', process.env.PORT || appConfig.app_run_port);
app.set('sport', appConfig.app_run_secure_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());

var store = new express.session.MemoryStore;

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

var routes = require('./routes/routes.js');
routes.setRoutes(app);

var server = http.createServer(app);
/*var server = https.createServer(options,app).listen(app.get('sport'),function(){
  console.log('Express server listening on https port ' + server.address().port);
});*/



// setting up socket.io
io = io.listen(server, {
    log: false
});

var socketIORoutes = require('./routes/socket.io/routes.js');
socketIORoutes.setRoutes(io);

// checking authorization for socket.io
/*
io.set('authorization', function(data, callback) {
    if (!data.headers.cookie) {
        return callback('No cookie transmitted.', false);
    }

    // We use the Express cookieParser created before to parse the cookie
    // Express cookieParser(req, res, next) is used initialy to parse data in "req.headers.cookie".
    // Here our cookies are stored in "data.headers.cookie", so we just pass "data" to the first argument of function
    cookieParser(data, {}, function(parseErr) {
        if (parseErr) {
            return callback('Error parsing cookies.', false);
        }

        // Get the SID cookie
        var sidCookie = (data.secureCookies && data.secureCookies[EXPRESS_SID_KEY]) ||
            (data.signedCookies && data.signedCookies[EXPRESS_SID_KEY]) ||
            (data.cookies && data.cookies[EXPRESS_SID_KEY]);

        // Then we just need to load the session from the Express Session Store
        sessionStore.load(sidCookie, function(err, session) {
            // And last, we check if the used has a valid session and if he is logged in
            if (err || !session || session.isLogged !== true) {
                callback('Not logged in.', false);
            } else {
                // If you want, you can attach the session to the handshake data, so you can use it again later
                // You can access it later with "socket.handshake.session"
                data.session = session;

                callback(null, true);
            }
        });
    });
});

*/

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});