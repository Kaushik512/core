var express = require("./node_modules/express");
var app = express();
var engine = require("./node_modules/ejs");
var path = require("path");
var http = require("http");
var childProcess = require('child_process');
var io = require('socket.io');

var appConfig = require('./app_config');
var settingsController = require('./controller/settings');



var mongoDbConnect = require('./controller/mongodb');
mongoDbConnect({
  host: process.env.DB_PORT_27017_TCP_ADDR,
  port: process.env.DB_PORT_27017_TCP_PORT,
  dbName: 'devops'
}, function(err) {
  if (err) {
    throw new Error(err);
  } else {
    console.log('connected to mongodb');
  }
});

app.set('port', process.env.PORT || appConfig.app_run_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.cookieSession({
  secret: 'sessionSekret'
}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'views')));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var verifySession = function(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};


var routes = require('./routes/routes.js');
routes.setRoutes(app);


var server = http.createServer(app);
io = io.listen(server, {
  log: false
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});