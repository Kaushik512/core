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
            callback(null, stackData);
        });
    };

    this.deleteStack = function(stackNameOrId, callback) {
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
        }, function(err, res) {
            if (err) {
                callback(err, null);
                return;
            };
            callback(null, res.Stacks);


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

    this.waitForStackCompleteStatus = function(stackId, callback) {
        var self = this;
        console.log('Checking status ==>');
        this.getStack(stackId, function(err, stack) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log('status ==>', stack.StackStatus);
            switch (stack.StackStatus) {
                case 'CREATE_IN_PROGRESS':
                    setTimeout(function() {
                        self.waitForStackCompleteStatus(stackId, callback);
                    }, 3000);
                    break;
                case 'CREATE_FAILED':
                    callback({
                        stackStatus: stack.StackStatus
                    }, null);
                    break;
                case 'CREATE_COMPLETE':
                    callback(null, stack);
                    break;
                default:
                    callback({
                        stackStatus: stack.StackStatus
                    }, null);
                    return;
            }

        });

    };

    function listStackResources(stackNameOrId, nextToken, callback) {
        cloudFormation.listStackResources({
            StackName: stackNameOrId,
            NextToken: nextToken
        }, function(err, res) {
            if (err) {
                callback(err, null);
                return;
            };
            callback(null, res);
        });
    }

    this.listAllStackResources = function(stackNameOrId, callback) {
        var self = this;
        var resources = [];

        function listResources(nextToken, callback) {
            listStackResources(stackNameOrId, nextToken, function(err, res) {
                if (err) {
                    callback(err, null);
                    return;
                }
                resources = resources.concat(res.StackResourceSummaries);
                if (res.NextToken) {
                    listResources(res.NextToken, callback);
                } else {
                    callback(null, resources);
                }

            });
        }
        listResources(null, callback);
    };

};


module.exports = AWSCloudFormation;