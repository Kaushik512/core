var java = require('java');
var appConfig = require('../config/app_config');
var nodeExtend = require('node.extend');
var fs = require('fs');
var net = require('net');
var random_port = require('random-port');
var events = require('events');
var util = require("util");

var currentDirectory = __dirname;

var indexOfSlash = currentDirectory.lastIndexOf("/");
if (indexOfSlash === -1) {
    indexOfSlash = currentDirectory.lastIndexOf("\\");
}
var D4DfolderPath = currentDirectory.substring(0, indexOfSlash + 1);



console.log(D4DfolderPath);
java.classpath.push(D4DfolderPath + '/java/lib/jsch-0.1.51.jar');
//java.classpath.push(D4DfolderPath + '/java/classes');
java.classpath.push('/home/anshul/eclipse-workspace/catalyst-ssh/bin');




var defaults = {
    port: 22,
    tempDir: appConfig.tempDir
};


function JavaSSHShell(javaSSHInstance, socketServer, callback) {

    var that = this;
    events.EventEmitter.call(this);

    var con;

    socketServer.on('connection', function(socket) {
        console.log('connection established');
        con = socket;
        con.setEncoding('utf8');
        con.setNoDelay(true);
        //listening to socket
        con.on('data', function(data) {
            console.log('got data ==>', data);
            console.log('type of data ==>',typeof data);
            that.emit('out', data);
            
        });

    });

    //opening connection 
    java.callMethod(javaSSHInstance, 'open', function(err, retCode) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        callback(null, that);
    });



    this.write = function(cmd) {
        if (con) {
            console.log('writing to socket ==>', cmd);
            con.write(cmd);
        }
    };

    this.close = function() {
        java.callMethod(javaSSHInstance, 'close', function(err, retCode) {
            if (err) {
                console.log(err);
                //return;
            }
            socketServer.close();
        });
    };

}

util.inherits(JavaSSHShell, events.EventEmitter);





module.exports.open = function(options, callback) {
    options = nodeExtend(defaults, options);
    if (options.password) {
        options.pemFilePath = null;
    } else {
        options.password = null;
    }

    random_port({
        from: 2000
    }, function(serverPort) {

        var socketServer = net.createServer();

        socketServer.listen(serverPort);

        java.newInstance('com.relevancelab.catalyst.security.ssh.SSHShell', options.host, options.port, options.username, options.password, options.pemFilePath, serverPort, function(err, javaSSHInstance) {
            if (err) {
                console.log(err);
                socketServer.close(); //closing server
                callback(err, null);
                return;
            }
            var javaSSHSHell = new JavaSSHShell(javaSSHInstance, socketServer, callback);
        });
    });


};