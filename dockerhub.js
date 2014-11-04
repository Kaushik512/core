var d = require('docker-hub');
console.log("D:" + d);
var hub = new d;


hub.get('v1/users',{"email":"saifi.khan@relevancelab.com","password":"","username":"saifikhan"},function(err,res,body){
	
});

// hightlevel
hub.auth({
  namespace: 'library',
  repository: 'saifikhan/testrepo'
}, function(err, res, body){
  // body...
});