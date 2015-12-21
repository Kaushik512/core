/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var logger = require('_pr/logger')(module);

var JiraApi = require('jira').JiraApi;
  var Jira = function(jiraSettings) {
    var jira = new JiraApi('https', jiraSettings.url, 443, jiraSettings.username,jiraSettings.password, '2.0.alpha1');
     //var that = this;
     logger.debug("Jira Authentication ================..%s",jiraSettings.url);

  this.getCurrentUser = function(callback) {
        jira.getCurrentUser(function(error, data) {
          //logger.debug("Jira Authentication ================",jiraSettings.url);
          if(error){
              logger.debug("Jira Authentication failed..");
              callback(error, null);
              return;
        }
            logger.debug("Jira Authentication Success..");
            callback(null, data);
    });

  }
}
module.exports = Jira;