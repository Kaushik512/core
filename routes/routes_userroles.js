var usersRoles = require('../controller/user-roles.js');


module.exports.setRoutes = function(app,adminSessionVerificationFunc) {
  

  app.post('/roles/create',adminSessionVerificationFunc,function(req,res){
    usersRoles.createRole(req.body.roleName,req.body.permissions,function(err,data){
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