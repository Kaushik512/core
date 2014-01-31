var express = require("./node_modules/express");
var app = express();
var engine = require("./node_modules/ejs");
var path = require("path");
var http = require("http");
var childProcess = require('child_process');
var io = require('socket.io');

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
	//console.log(req.body);
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
      //console.log(data); 	
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


function getRolesListArguments(rolesArray) {
  
  var str = [];
  console.log('rolesArray ==> ' + rolesArray);
  for(var i=0;i<rolesArray.length;i++) {
    var role = rolesArray[i];
    switch(role) {
      case 'JIRA':
      str.push('recipe[jira-d4d]');
      break;
      case 'Crowd':
      str.push('recipe[crowd-d4d]');
      break;
      case 'Confluence':
      str.push('recipe[confluence-d4d]');
      break;
      case 'Jenkins':
      str.push('recipe[jenkins-d4d]');
      break;
      case 'Nexus':
      str.push('recipe[nexus-d4d]');
      break;
      case 'Rundeck':
      str.push('recipe[rundeck-d4d]');
      break;
      case 'Nagios':
      str.push('recipe[nagios-d4d]');
      break;
      case 'Selenium':
      str.push('recipe[selenium-d4d]');
      break;
    }
  }
  return str;

}


var instancesStatus = {};



app.post('/start',verifySession, function(req, resp){
	console.log(req.body);
  var selectedInstances = req.body;
  if(selectedInstances) {
    var keys = Object.keys(selectedInstances);
    var count = keys.length;
    var launchedInstanceIds = [];
    for(var i = 0;i<keys.length;i++) {
      if(selectedInstances[keys[i]].amiid) {


        (function(inst) {

        ec2.launchInstance(inst.amiid,"CloudMgmtTest",{terminate:true,delay:600000},function(err,data) {
          
          //console.log(data);
          if(err) {
            resp.json({error:err});
            return;
          }

          launchedInstanceIds.push({instanceId:data.Instances[0].InstanceId,title:inst.title});
          instancesStatus[data.Instances[0].InstanceId]= {};
          instancesStatus[data.Instances[0].InstanceId].statusText = "Instance Started";
          if(count>1) {
            count--;
          } else {
            resp.json({launchedInstanceIds:launchedInstanceIds});
          }
        },function(instanceId){
           instancesStatus[instanceId].statusText = "Waiting for instance.";
           if(instancesStatus[instanceId].socket) {
            instancesStatus[instanceId].socket.emit('instance-starting',{status:"Waiting for instance.",instanceId:instanceId});
           }

        },function(instanceData){

          //var decoder = new StringDecoder('utf8');

          console.log("instance is now in running state");
          console.log("bootstapping the instance");
          
          instancesStatus[instanceData.InstanceId].statusText = "Bootstraping the instance.";
          if(instancesStatus[instanceData.InstanceId] && instancesStatus[instanceData.InstanceId].socket) {
            instancesStatus[instanceData.InstanceId].socket.emit('instance-start-bootstrapping',{status:"Bootstrapping the instance.",instanceId:instanceData.InstanceId});
          }

          //genrating runlist for roles 
          if(!inst.runlist) {
            inst.runlist = '';
          } 
          var rolesArg =  getRolesListArguments(inst.runlist.split(','));

          //generating runlist
          var runlistSelected = inst.runlistSelected;
          var runlistSelectedArg = [];
          if(runlistSelected && runlistSelected.length) {
            for(var k=0;k<runlistSelected.length;k++) {
             runlistSelectedArg.push('recipe['+runlistSelected[k]+']');
            }
          }
          
          console.log(rolesArg);
          console.log(runlistSelectedArg);

          var combinedRunList =  rolesArg.concat(runlistSelectedArg);
          console.log(combinedRunList);
          var spawn = childProcess.spawn;
          var knifeProcess;
          if(combinedRunList && combinedRunList.length) {
            knifeProcess = spawn('knife', ['bootstrap',instanceData.PublicIpAddress,'-i/home/anshul/CloudMgmtTest.pem','-r'+combinedRunList.join(),'-xroot'],{
             cwd:'/home/anshul/Downloads/chef-repo'
            });  
          } else {
            knifeProcess = spawn('knife', ['bootstrap',instanceData.PublicIpAddress,'-i/home/anshul/CloudMgmtTest.pem','-xroot'],{
             cwd:'/home/anshul/Downloads/chef-repo'
            });
          }

          knifeProcess.stdout.on('data', function (data) {
             console.log('stdout: ==> ' + data);
             if(instancesStatus[instanceData.InstanceId] && instancesStatus[instanceData.InstanceId].socket) {
              instancesStatus[instanceData.InstanceId].socket.emit('instance-bootstrapping',{status:data.toString('ascii'),instanceId:instanceData.InstanceId});
             }
          });
          knifeProcess.stderr.on('data', function (data) {
            console.log('stderr: ==> ' + data);
             if(instancesStatus[instanceData.InstanceId] && instancesStatus[instanceData.InstanceId].socket) {
              instancesStatus[instanceData.InstanceId].socket.emit('instance-bootstrapping-error',{status:data.toString('ascii'),instanceId:instanceData.InstanceId});
             }
          });

          knifeProcess.on('close', function (code) {
            if(code === 0) {
              if(instancesStatus[instanceData.InstanceId] && instancesStatus[instanceData.InstanceId].socket) {
               instancesStatus[instanceData.InstanceId].socket.emit('instance-bootstrapped',{status:"Instance Successfully Bootstrapped.",instanceId:instanceData.InstanceId,code:code});
              }
            } else {
              if(instancesStatus[instanceData.InstanceId] && instancesStatus[instanceData.InstanceId].socket) {
               instancesStatus[instanceData.InstanceId].socket.emit('instance-bootstrapped',{status:"Instance Bootstrapping failed.",instanceId:instanceData.InstanceId,code:code});
              }
            }
           console.log('child process exited with code ' + code);
          });
        },function(terminatedInstance,err){
            if(err) {
             return; 
            }
            if(instancesStatus[terminatedInstance.InstanceId]) {
              console.log('Removin instance from list '+terminatedInstance.InstanceId);
              console.log('before');
              console.log(instancesStatus);
              delete instancesStatus[terminatedInstance.InstanceId];

            }

        });//ends here

        })(selectedInstances[keys[i]]);


      }
    }
  } else {
    resp.json({error:"Invalid input parameters"});
  } 


});



app.post('/domainDetails',verifySession,function(req,resp){
  var launchedInstancesDetails = req.body.launchInstances;
  var keys = Object.keys(launchedInstancesDetails);
  var instanceIds = [];
  for(var i=0;i<keys.length;i++) {
    instanceIds.push(keys[i]);
  }
  ec2.describeInstances(instanceIds,function(err,data){
    console.log('desc');
    console.log(data);
    if(err) {
        
    } else {
       for(var j=0;j<data.Reservations.length;j++) {
        var instances = data.Reservations[j].Instances;
        console.log(instances);
        for(var i=0;i<instances.length;i++) {
             launchedInstancesDetails[instances[i].InstanceId].ip = instances[i].PublicIpAddress;
             launchedInstancesDetails[instances[i].InstanceId].publicDns = instances[i].PublicDnsName;  
        }
      }

    }
    console.log('launchedInstancesDetails');
    console.log(launchedInstancesDetails);
    resp.render('domainDetails',{error:err,instancesDetails:launchedInstancesDetails,domainName:req.body.domainName});
  });


});




var server = http.createServer( app );
io = io.listen(server,{ log: false });

server.listen( app.get( 'port' ), function(){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
});

io.sockets.on('connection', function (socket) {
  socket.on('registerInstanceIds', function (data) {
    for(var i=0;i<data.instanceIds.length;i++) {
      console.log('ins ID ==> '+data.instanceIds[i].instanceId);
      if(instancesStatus[data.instanceIds[i].instanceId]) {
        console.log("registering socket");
        instancesStatus[data.instanceIds[i].instanceId].socket = socket;
        socket.emit('instance-starting',{status:"Waiting for instance.",instanceId:data.instanceIds[i].instanceId});
      }
    }
  });

  socket.on('disconnect', function () {
    console.log('disconnecting ... ');
    var keys = Object.keys(instancesStatus);
    for(var i=0;i<keys.length;i++) {
      if(instancesStatus[keys[i]].socket == this) {
        console.log('disconnected ... removing socket');  
        delete instancesStatus[keys[i]];
      }
    }
  });
});