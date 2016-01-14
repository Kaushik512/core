var Slack = require('slack-node');
//var logger = require('_pr/logger')(module);
//webhookUri = "https://hooks.slack.com/services/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";
slack = new Slack();
module.exports = {
  slackMessage:function(webhookUri,channel,username,msg){
    console.log("webhookUri",webhookUri);
      slack.setWebhook("https://hooks.slack.com/services/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");
      slack.webhook({
        channel: channel,
        username: username,
        text: msg
      }, function(err, response) {
        console.log(response);
       });
  }
};
