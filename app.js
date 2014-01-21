var express = require("./node_modules/express");
var app = express();
var engine = require("./node_modules/ejs");
var path = require("path");
var http = require("http");

var appConfig = require('./app_config');

app.set('port', process.env.PORT || appConfig.app_run_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use( express.cookieParser());
app.use(express.cookieSession({
	secret: 'sessionSekret'
}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'views')));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var verifySession = function(req,res,next){
	if(req.session && req.session.tempSession) {
		next();
	} else {
		res.redirect('/login.html');
	}
};


app.post('/signin',function(req,res){
   console.log(req.body)
   if(req.body && req.body.username && req.body.pass) {
   	if(req.body.username === 'admin' && req.body.pass === "pass"){
      req.session.tempSession = true;
      products.getProducts(function(err,products){
		res.render('index',{error:err,products:products});
      });
   	
   	} else {
       res.redirect('/login.html');
   	}  
   } else {
       res.redirect('/login.html');
   }

   //req.session.tempSession = true;
   
});

app.get('/signout',function(req,res){
  req.session = null;
  res.redirect('/login.html');
});


var products = require('./controller/products.js')

app.get('/',verifySession, function(req, res){
   
   products.getProducts(function(err,products){
		res.render('index',{error:err,products:products});
   });
});

var cookbooks =  require('./controller/GetRecipies');

app.post('/cookbooks',verifySession, function(req, res){
	console.log('Returning Available Cookbooks...!!');
	console.log(req.body);
	//res.render('cookbooks');
	cookbooks.getCookbooks(function(err, resp){
		console.log('About to Render...!! ');
		//console.log(err);
		//console.log(resp);
		res.render('cookbook', {error: err, cookbooks: resp,prodSelected:req.body});
	});
});

app.get('/products/:pid',verifySession,function(req,res) {
  console.log(req.params);
  var pid = req.params.pid;
  if(pid) {
    products.getProductComponents(pid,function(err,data){
      console.log(data); 	
      res.render('componentslist.ejs',{error:err,prod:data});
    });	
  } else {
  	//res.sendStatus(404);
  }
});


var ec2 = require('./controller/AWS_EC2');
app.get('/images', function(req, resp){
	ec2.getImageNames(function(err, data){
		//resp.render('');
		resp.end(JSON.stringify(data));
	});
});

app.post('/start',verifySession, function(req, resp){
	console.log(req.body.image_id);
	console.log(req.body.min);
	console.log(req.body.max);
	if(req.body.image_id && req.body.min && req.body.max)
		ec2.runInstances(req.body.image_id, req.body.min, req.body.max, req.body.name == undefined?'':req.body.name ,{terminate:true,delay:300000},function(err, data){
			resp.json({"data" :data, "error" : err});
		});
});



http.createServer( app ).listen( app.get( 'port' ), function(){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
} );