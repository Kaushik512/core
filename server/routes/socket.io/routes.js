var instanceDao = require('../../model/dao/instancesdao.js');
var javaSSHShellwrapper = require('../../model/javaSSHShellWrapper.js');
var logger = require('../../lib/logger')(module);



module.exports.setRoutes = function(socketIo) {

    var sshShell = socketIo.of('/sshShell');

    var socketList = [];

    sshShell.on('connection', function(socket) {
        socketList.push[socket];
        //console.log('socket ==>',socket);
        socket.on('open', function(instanceData) {
            instanceDao.getInstanceById(instanceData.id, function(err, instances) {
                logger.debug(instanceData.id);
                if (err) {
                    logger.error(err);
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
                }, function(err, shell, retCode) {
                    if (err) {
                        socket.emit('conErr', {
                            message: "Unable to connect to instance"
                        });
                        return;
                    }
                    if (retCode === 0) {
                        socket.shellInstance = shell;
                        shell.on('out', function(outData) {
                            socket.emit('out', {
                                res: outData
                            });
                        });

                        shell.on('close', function() {
                            socket.shellInstance = null;
                            socket.emit('close');
                        });


                        socket.emit('opened');
                    } else if(retCode === -5000) {
                        socket.emit('conErr', {
                            message: "Host Unreachable"
                        });
                    } else if(retCode === -5001) {
                        socket.emit('conErr', {
                            message: "The username or password/pemfile you entered is incorrect"
                        });
                    } else {
                        socket.emit('conErr', {
                            message: "Unable to connect to instance, error code = "+retCode 
                        });
                    }
                });
            });
        });

        socket.on('cmd', function(data) {

            if (socket.shellInstance) {
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
            logger.debug('Got disconnect!');
            if (socket.shellInstance) {
                socket.shellInstance.close();
                socket.shellInstance = null;
            }
        });

    });


};