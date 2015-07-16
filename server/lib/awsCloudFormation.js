var aws = require('aws-sdk');
var logger = require('_pr/logger')(module);


if (process.env.http_proxy) {
    aws.config.update({
        httpOptions: {
            proxy: process.env.http_proxy
        }
    });
}
var AWSCloudFormation = function(awsSettings) {

    var cloudFormation = new aws.CloudFormation({
        "accessKeyId": awsSettings.access_key,
        "secretAccessKey": awsSettings.secret_key,
        "region": awsSettings.region
    });

    var that = this;

    this.createStack = function(stackOptions, callback) {
        var options = {
            StackName: stackOptions.name,
            Parameters: stackOptions.templateParameters,

        };
        if (stackOptions.templateBody) {
            options.TemplateBody = stackOptions.templateBody;
        } else {
            options.TemplateURL = stackOptions.templateBody;
        }
        cloudFormation.createStack(options, function(err, stackData) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(stackData);
        });
    };

    this.deleteStack = function(stackNameOrId) {
        cloudFormation.deleteStack({
            StackName: stackNameOrId
        }, function(err, deleteData) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, deleteData);
        });
    };



    function describeStacks(stackNameOrId, nextToken, callback) {
        cloudFormation.describeStacks({
            StackName: stackNameOrId,
            NextToken: nextToken
        }, function(err, stacks) {
            if (err) {
                callback(err, null);
                return;
            };
            callback(null, stacks);


        });

    }

    this.getListOfStacks = function(nextToken, callback) {
        describeStacks(null, nextToken, callback);
    };

    this.getStack = function(stackNameOrId, callback) {
        if (!stackNameOrId) {
            process.nextTick(function() {
                callback(null, null);
            });
            return;
        }
        describeStacks(stackNameOrId, null, function(err, stacks) {
            if (err) {
                callback(err, null);
                return;
            }
            if (stacks.length) {
                callback(null, stacks[0]);
            } else {
                callback(null, null);
            }
        });

    };



};

module.exports = AWSCloudFormation;