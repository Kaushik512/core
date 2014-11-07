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
var settingsController = require('./controller/settings');
var RedisStore = require('connect-redis')(express);


var mongoDbConnect = require('./controller/mongodb');
mongoDbConnect({
  host: process.env.DB_PORT_27017_TCP_ADDR,
  port: process.env.DB_PORT_27017_TCP_PORT,
  dbName: 'devops_new'
}, function(err) {
  if (err) {
    throw new Error(err);
  } else {
    console.log('connected to mongodb');
  }
});

app.set('port', process.env.PORT || appConfig.app_run_port);
app.set('sport',appConfig.app_run_secure_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
/*var store = new RedisStore({
  host: 'localhost',
  port: 6379
});*/
var store = new express.session.MemoryStore;

app.use(express.session({
  secret: 'sessionSekret',
  store: store
}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


var options = {key:    fs.readFileSync('rlcatalyst.key'),
    cert:   fs.readFileSync('rlcatalyst.cert'),
    requestCert:        true,
    rejectUnauthorized: false}

var routes = require('./routes/routes.js');
routes.setRoutes(app);

//var server = http.createServer(app);
var server = https.createServer(options,app).listen(app.get('sport'),function(){
  console.log('Express server listening on https port ' + server.address().port);
});

io = io.listen(server, {
  log: false
});

/*(server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});*/
