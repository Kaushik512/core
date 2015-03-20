var logger = require('../lib/logger')(module);

//var jira = require('nodejs-jira-wrapper');
JiraApi = require('jira').JiraApi;
  var MyJiraApi = function(awsSettings) {
    var jira = new JiraApi('https', 'relevancelab.atlassian.net', '443', 'gobinda.das', 'basantakumar_86', '2.0.alpha1');
     var that = this;

  this.findIssue = function(callback) {
        jira.getProject('Catalyst', function(error, issue) {
            if (error) {
                logger.debug("Some Error happen while login.");
                callback(error, null);
                return;
            }
            logger.debug("Login Success with Jira.");
            callback(null, data);
        });
    }
	
}
module.exports = MyJiraApi;