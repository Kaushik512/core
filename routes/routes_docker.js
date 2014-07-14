module.exports.setRoutes = function(app, verifySession) {
  
  app.get('/docker',verifySession,function(req,res){
   res.render('docker');
  });

};