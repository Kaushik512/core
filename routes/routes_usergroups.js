var usersGroups = require('../controller/user-groups.js');


module.exports.setRoutes = function(app,adminSessionVerificationFunc) {
  

  app.post('/groups/create',adminSessionVerificationFunc,function(req,res){
    usersGroups.createGroup(req.body.groupName,function(err,data){
      if(err) {
      	console.log(err);
      	res.send(500);
      	return;
      }
      console.log(data);
      res.send(data);
    });

  });


}