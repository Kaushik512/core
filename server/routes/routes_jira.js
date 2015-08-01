var logger = require('../lib/logger')(module);
var Jira = require('../lib/jira');
module.exports.setRoutes = function(app,sessionVerificationFunc){
	app.all('/jira/*',sessionVerificationFunc);

app.post('/jira/test',function(req,res){
	logger.debug("Jira Authentication..");
var jira = new Jira({
	    "username":req.body.jirausername,
	    "password":req.body.jirapassword,
	    "url":req.body.jiraurl
});

jira.getCurrentUser(function(error, data) {
	logger.debug("method called...");
  if(error){
    logger.debug("Jira Authentication failed..");
    res.send("Unable to connect Jira.",500);
    return;
  }
  logger.debug("Jira Authentication Success..");
  res.send(data);
  return;
     });

  });

}