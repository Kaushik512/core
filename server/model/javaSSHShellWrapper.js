/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var java = require('java');
var appConfig = require('../config/app_config');
var extend = require('extend');

var net = require('net');
var random_port = require('random-port');
var events = require('events');
var util = require("util");

var fileIo = require('../lib/utils/fileio.js');
var uuid = require('node-uuid');

var currentDirectory = __dirname;

var indexOfSlash = currentDirectory.lastIndexOf("/");
if (indexOfSlash === -1) {
    indexOfSlash = currentDirectory.lastIndexOf("\\");
}
var D4DfolderPath = currentDirectory.substring(0, indexOfSlash + 1);



logger.debug(D4DfolderPath);
java.classpath.push(D4DfolderPath + '/java/lib/jsch-0.1.51.jar');
java.classpath.push(D4DfolderPath + '/java/classes');
//java.classpath.push('/home/anshul/eclipse-workspace/catalyst-ssh/bin');




var defaults = {
    port: 22,
    tempDir: appConfig.tempDir
};


function JavaSSHShell(options, javaSSHInstance, socketServer, callback) {

    var that = this;
    events.EventEmitter.call(this);

    var con;

    socketServer.on('connection', function(socket) {
        logger.debug('socket connection established');
        con = socket;
        con.setEncoding('utf8');
        con.setNoDelay(true);
        //listening to socket
        con.on('data', function(data) {

            //logger.debug('type of data ==>',typeof data);
            that.emit('out', data);

        });

        con.on('close', function() {
            that.close();
            that.emit('close');
        });

    });

    //opening connection 
    java.callMethod(javaSSHInstance, 'open', function(err, retCode) {
        if (err) {
            logger.debug(err);
            that.close();
            callback(err, null);
            return;
        }
        callback(null, that,retCode);
    });



    this.write = function(cmd) {
        if (con) {
            con.write(cmd);
        }
    };

    this.close = function() {
        java.callMethod(javaSSHInstance, 'close', function(err, retCode) {
            if (err) {
                logger.debug(err);
                //return;
            }
            logger.debug('closing server');
            try {
                socketServer.close();
            } catch (err) {
                logger.debug('socket is closed');
            }
        });

        if (options.pemFilePath) {
            fileIo.removeFile(options.pemFilePath, function() {
                logger.debug('pem file deleted');
            });
        }
    };

}

util.inherits(JavaSSHShell, events.EventEmitter);


function openSSH(options, callback) {

    random_port({
        from: 2000
    }, function(serverPort) {

        var socketServer = net.createServer();

        socketServer.listen(serverPort);

        java.newInstance('com.relevancelab.catalyst.security.ssh.SSHShell', options.host, options.port, options.username, options.password, options.pemFilePath, serverPort, function(err, javaSSHInstance) {
            if (err) {
                logger.debug(err);
                socketServer.close(); //closing server
                callback(err, null);
                return;
            }
            var javaSSHSHell = new JavaSSHShell(options, javaSSHInstance, socketServer, callback);
        });
    });

}



module.exports.open = function(options, callback) {
    var def = extend({},defaults);
    options = extend(def,options);
    
    if (options.password) {
        options.pemFilePath = null;
        openSSH(options, callback);
    } else {
        options.password = null;
        if (options.pemFileData) {
            var tempPemFileLocation = options.tempDir + '/' + uuid.v4();
            fileIo.writeFile(tempPemFileLocation, options.pemFileData, null, function(err) {
                if (err) {
                    logger.debug('unable to create pem file ', err);
                    callback(err, null);
                    return;
                }
                options.pemFilePath = tempPemFileLocation;
                openSSH(options, callback);
            });

        } else {
            openSSH(options, callback);
        }
    }

};