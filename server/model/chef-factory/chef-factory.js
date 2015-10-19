var Chef = require('_pr/lib/chef');
var fileIo = require('_pr/lib/utils/fileio');


function fixPath(path) {
    if (path) {
        if (path[0] == '/') {
            path = path.slice(1);
        }
        if (path.length && path.length >= 2) {
            if (path[path.length - 1] == '/') {
                path = path.slice(0, path.length - 1);
                console.log('after slicing');
                console.log(path);
            }
        } else {
            if (path[0] == '/') {
                path = path.slice(1);
            }
        }
    } else {
        path = '';
    }
    return path;
}

var ChefFactory = function ChefFactory(chefSettings) {
    var chef = new Chef(chefSettings);

    this.sync = function sync(callback) {
        chef.syncCookbooks(function(err) {
            if (err) {
                callback(err, null);
                return;
            }
            chef.syncRoles(function(err) {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(null);
            });

        });
    };

    this.getCookbookData = function(path, callback) {
        path = fixPath(path);
        var rootDir = chefSettings.userChefRepoLocation + '/cookbooks/';
        fileIo.isDir(rootDir + path, function(err, dir) {
            if (err) {
                callback(err);
                return;
            }
            if (dir) {
                fileIo.readDir(rootDir, path, function(err, dirList, filesList) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    var chefUserName;
                    if (chefSettings.chefUserName) {
                        chefUserName = chefSettings.chefUserName;
                    }
                    callback(null, {
                        resType: 'dir',
                        files: filesList,
                        dirs: dirList,
                        chefUserName: chefUserName
                    });
                });
            } else { // this is a file
                fileIo.readFile(rootDir + path, function(err, fileData) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, {
                        resType: "file",
                        fileData: fileData.toString('utf-8')
                    });
                })
            }
        });
    };

    this.saveCookbookFile = function(filePath, fileContent, callback) {
        filePath = fixPath(filePath);
        if (filePath) {
            fileIo.writeFile(chefSettings.userChefRepoLocation + '/cookbooks/' + filePath, fileContent, 'utf-8', function(err) {
                if (err) {
                    callback(err, null);
                    return;
                }
                //extracting cookbook name;
                var cookbookName = '';

                var indexOfSlash = filePath.indexOf('/');
                if (indexOfSlash != -1) {
                    cookbookName = filePath.substring(0, indexOfSlash);
                }
                if (cookbookName) {
                    var chef = new Chef(chefSettings);
                    chef.uploadCookbook(cookbookName, function(err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                } else {
                    callback({
                        message: "Invalid Cookbook name"
                    });
                }
            });
        } else {
            callback({
                message: "Invalid file path"
            }, null);
        }
    };

    this.getRoleData = function(path, callback) {
        path = fixPath(path);
        var rootDir = chefSettings.userChefRepoLocation + '/roles/';
        fileIo.isDir(rootDir + path, function(err, dir) {
            if (err) {
                callback(err);
                return;
            }
            if (dir) {
                fileIo.readDir(rootDir, path, function(err, dirList, filesList) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    var chefUserName;
                    if (chefSettings.chefUserName) {
                        chefUserName = chefSettings.chefUserName;
                    }
                    callback(null, {
                        resType: 'dir',
                        files: filesList,
                        dirs: dirList,
                        chefUserName: chefUserName
                    });
                });
            } else { // this is a file
                fileIo.readFile(rootDir + path, function(err, fileData) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, {
                        resType: "file",
                        fileData: fileData.toString('utf-8')
                    });
                })
            }
        });
    };

    this.saveRoleFile = function(filePath, fileContent, callback) {
        filePath = fixPath(filePath);
        if (filePath) {
            fileIo.writeFile(chefSettings.userChefRepoLocation + '/roles/' + filePath, fileContent, 'utf-8', function(err) {
                if (err) {
                    callback(err, null);
                    return;
                }
                //extracting cookbook name;
                var cookbookName = '';

                var indexOfSlash = filePath.indexOf('/');
                if (indexOfSlash != -1) {
                    cookbookName = filePath.substring(0, indexOfSlash);
                }
                if (cookbookName) {
                    var chef = new Chef(chefSettings);
                    chef.uploadCookbook(cookbookName, function(err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                } else {
                    callback({
                        message: "Invalid Cookbook name"
                    });
                }
            });
        } else {
            callback({
                message: "Invalid file path"
            }, null);
        }
    };



};

module.exports = ChefFactory;