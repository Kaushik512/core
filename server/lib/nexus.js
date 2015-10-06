/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Oct 2015
 */

// This file act as a interface between catalyst and nexus.


var Client = require('node-rest-client').Client;
var logger = require('_pr/logger')(module);
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var parser = require('xml2json');

var Nexus = function() {
    this.authenticateNexus = function(requestBody, callback) {
        logger.debug("Got req for nexus authentication: ", JSON.stringify(requestBody));
        var options_auth = {
            user: requestBody['username'],
            password: requestBody['nexuspassword']
        };
        client = new Client(options_auth);
        var nexusUrl = requestBody['hostname'] + '/service/local/users';
        logger.debug('nexusUrl', nexusUrl);
        client.registerMethod("jsonMethod", nexusUrl, "GET");
        var reqSubmit = client.methods.jsonMethod(function(data, response) {
            logger.debug("response: ", response);
            logger.debug("data: ", JSON.stringify(data));
            callback(data);
        });

        // Handling Exception for nexus req.
        reqSubmit.on('error', function(err) {
            console.log('Something went wrong on req!!', err.request.options);
            callback([]);
        });
    }

    this.getNexusRepositories = function(anId, callback) {
        d4dModelNew.d4dModelMastersNexusServer.find({
            rowid: anId,
            id: "26"
        }, function(err, nexus) {
            if (err) {
                logger.debug(500, "Failed to fetch Nexus Server from DB.", err);
                callback(err, null);
            }
            if (nexus.length) {
                var options_auth = {
                    user: nexus[0].username,
                    password: nexus[0].nexuspassword
                };
                client = new Client(options_auth);
                //var nexusUrl = nexus[0].hostname + '/service/local/all_repositories';
                var nexusUrl = nexus[0].hostname + '/service/local/repositories';
                client.registerMethod("jsonMethod", nexusUrl, "GET");
                var reqSubmit = client.methods.jsonMethod(function(data, response) {
                    //logger.debug("response: ", response);
                    var json = parser.toJson(data);
                    logger.debug("data: ", JSON.stringify(json));
                    callback(null, json);
                });
            } else {
                callback(null, null);
            }
        });
    }

    this.getNexusArtifact = function(anId, repoName, callback) {
        d4dModelNew.d4dModelMastersNexusServer.find({
            rowid: anId,
            id: "26"
        }, function(err, nexus) {
            if (err) {
                logger.debug(500, "Failed to fetch Nexus Server from DB.", err);
                callback(err, null);
            }
            if (nexus.length) {
                var options_auth = {
                    user: nexus[0].username,
                    password: nexus[0].nexuspassword
                };
                client = new Client(options_auth);
                //var nexusUrl = nexus[0].hostname + '/service/local/data_index?q=org.javaee7.sample';
                var nexusUrl = nexus[0].hostname + '/service/local/data_index?q='+nexus[0].groupid;
                client.registerMethod("jsonMethod", nexusUrl, "GET");
                client.methods.jsonMethod(function(data, response) {
                    //logger.debug("response: ", response);
                    var json = parser.toJson(data);
                    logger.debug("data: ", typeof json);
                    json = JSON.parse(json);
                    if (json) {
                        var artifactList = [];
                        var artifacts = json['search-results'].data.artifact;
                        for (var i = 0; i < artifacts.length; i++) {
                            if (repoName === artifacts[i].repoId) {
                                artifactList.push(artifacts[i]);
                            }
                        }
                    }
                    callback(null, artifactList);
                });
            } else {
                callback(null, null);
            }
        });
    }

    this.getNexusArtifactVersions = function(anId, repoName, reqBody, callback) {
        d4dModelNew.d4dModelMastersNexusServer.find({
            rowid: anId,
            id: "26"
        }, function(err, nexus) {
            if (err) {
                logger.debug(500, "Failed to fetch Nexus Server from DB.", err);
                callback(err, null);
            }
            if (nexus.length) {
                var options_auth = {
                    user: nexus[0].username,
                    password: nexus[0].nexuspassword
                };
                client = new Client(options_auth);
                var groupId = reqBody.groupId.replace(/\./g, '/');
                var nexusUrl = nexus[0].hostname + '/service/local/repositories/' + repoName + '/content/' + groupId + '/' + reqBody.artifactId + '/maven-metadata.xml';
                client.registerMethod("jsonMethod", nexusUrl, "GET");
                var reqSubmit = client.methods.jsonMethod(function(data, response) {
                    logger.debug("nexusUrl: ", nexusUrl);
                    logger.debug("data: ", JSON.stringify(data));
                    callback(null, data);
                });
            } else {
                callback(null, null);
            }
        });
    }
}

module.exports = new Nexus();
