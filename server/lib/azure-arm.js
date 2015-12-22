//var sys = require('sys');
var exec = require('child_process').exec;
var SSHExec = require('./utils/sshexec');
var logger = require('_pr/logger')(module);
var Process = require("./utils/process");
var Curl = require("./utils/curl.js");
var appConfig = require('_pr/config');

var path = require('path');
var fs = require('fs');
var request = require('request');

var waitForPort = require('wait-for-port');
var adal = require('adal-node');


var ARM = function(options) {

    /*var options = {
        subscriptionId: "f2c53cd4-5d0f-4c6d-880b-6af801de9b21",
        certLocation: "/Office/Work/Azure/certs/management.pem",
        keyLocation: "/Office/Work/Azure/certs/management.key"
    };*/

    var clientId = '53114209-b33b-497c-be26-6e282cad85ef'//'4c7921bf-0f41-453d-a79e-59d4af1f8a3e';
    var clientSecret = '+1c3YrAq4DbGnRxdnlU84IyYhPtI7UC5F7s2joNmwBI='//'opCdluv+n2FVFA2bBsDHonvnKArxyfEhgDEzl4PsjCA='
    var tenant = '5a96ecbd-b05f-4363-a243-713dc2588bea';

    var token = options.token;


    function getToken(callback) {
        if (!token) {

            var authorityHostUrl = 'https://login.windows.net';

            var resource = 'https://management.azure.com/';
            var authorityUrl = authorityHostUrl + '/' + tenant;

            console.log("authorityUrl: ", authorityUrl);

            var AuthenticationContext = adal.AuthenticationContext;

            var context = new AuthenticationContext(authorityUrl);

            context.acquireTokenWithClientCredentials(resource, clientId, clientSecret, function(err, tokenResponse) {
                if (err) {
                    callback(err, null);
                    return;
                } else {
                    console.log('token ==> ', tokenResponse);
                    token = tokenResponse.accessToken;
                    callback(null, tokenResponse.accessToken);
                }
            });

        } else {
            process.nextTick(function() {
                callback(null, token);
            });
        }
    }



    this.getResourceGroups = function(callback) {

        getToken(function(err, token) {
            if (err) {
                callback(err, null);
                return;
            }

            console.log('subscrition ID ==>' + options.subscriptionId);

            var opts = {
                uri: 'https://management.azure.com/subscriptions/' + options.subscriptionId + '/resourcegroups?api-version=2015-01-01',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            }

            request.get(opts, function(err, response, body) {

                if (err) {
                    //console.log("Error...",err);
                    callback(err, null);
                    return;
                }

                console.log("response.statusCode: ", response.statusCode);

                if (response.statusCode == '200') {
                    logger.debug("END:: getServerByName");
                    callback(null, body);
                    return;
                } else {
                    callback(body, null);
                    return;
                }

            });
        });


    };

    this.createResourceGroup = function(name, callback) {

        getToken(function(err, token) {
            if (err) {
                callback(err, null);
                return;
            }

            var opts = {
                uri: 'https://management.azure.com/subscriptions/' + options.subscriptionId + '/resourcegroups/' + name + '?api-version=2015-01-01',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: {
                    "location": "West US",
                    "tags": {
                        "tagname1": "tagvalue1"
                    }
                },
                json:true
            }

            request.put(opts, function(err, response, body) {

                if (err) {
                    //console.log("Error...",err);
                    callback(err, null);
                    return;
                }

                console.log("response.statusCode: ", response.statusCode);

                if (response.statusCode == '200') {
                    logger.debug("END:: getServerByName");
                    callback(null, body);
                    return;
                } else {
                    callback(body, null);
                    return;
                }

            });
        });

    };

}


module.exports = ARM;