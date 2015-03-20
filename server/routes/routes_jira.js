var logger = require('../lib/logger')(module);
var MyJiraApi = require('../lib/jira.js');
var JiraApi = require('jira').JiraApi;
module.exports.setRoutes = function(app,sessionVerificationFunc){
	app.all('/jira/*',sessionVerificationFunc);

app.post('/jira/test',function(req,res){
	var username=req.body.jirausername;
	var password=req.body.jirapassword;
	var url=req.body.jiraurl;
	logger.debug("Jira Authentication..%s %s %s",username,password,url)
var jira = new JiraApi('https', url, 443, username,password, '2.0.alpha1');

jira.getCurrentUser(function(error, data) {
  if(error){
    logger.debug("Jira Authentication failed..")
    res.send("Unable to connect Jira.",500);
    return;
  }
  logger.debug("Jira Authentication Success..")
  //res.send(data);
});

});

}