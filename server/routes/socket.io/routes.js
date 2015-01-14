var instanceDao = require('../../model/instances.js');
var javaSSHShellwrapper = require('../../model/javaSSHShellWrapper.js');




module.exports.setRoutes = function(socketIo) {

    var sshShell = socketIo.of('/sshShell');

    var socketList = [];

    sshShell.on('connection', function(socket) {
        socketList.push[socket];
        //console.log('socket ==>',socket);
        socket.on('open', function(instanceData) {
            instanceDao.getInstanceById(instanceData.id, function(err, instances) {
                if (err) {
                    socket.emit('conErr', {
                        message: "Invalid instance Id"
                    });
                    return;
                }
                if (!instances.length) {
                    socket.emit('conErr', {
                        message: "Invalid instance Id"
                    });
                    return;
                }
                var instance = instances[0]
                    // create ssh session with the instance
                javaSSHShellwrapper.open({
                    host: instance.instanceIP,
                    port: 22,
                    username: instanceData.username,
                    password: instanceData.password,
                    pemFileData: instanceData.pemFileData
                }, function(err, shell) {
                    if (err) {
                        socket.emit('conErr', {
                            message: "Unable to connect to instance"
                        });
                        return;
                    }
                    socket.shellInstance = shell;
                    //console.log(shell.on);
                    shell.on('out', function(outData) {
                        socket.emit('out', {
                            res: outData
                        });
                    });
                    socket.emit('opened');
                });
            });
        });

        socket.on('cmd', function(data) {
            console.log("cmd Recieved", data);
            if (socket.shellInstance) {
                console.log('writing');
                socket.shellInstance.write(data);
            }
        });

        socket.on('close', function() {
            if (socket.shellInstance) {
                socket.shellInstance.close();
                socket.shellInstance = null;
            }
        });

        socket.on('disconnect', function() {
            console.log('Got disconnect!');
            if (socket.shellInstance) {
                socket.shellInstance.close();
                socket.shellInstance = null;
            }
        });

    });


};