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

    this.getFactoryItems = function(callback) {
        chef.getCookbooksList(function(err, cookbookList) {
            if (err) {
                callback(err, null);
                return;
            }
            chef.getRolesList(function(err, rolesList) {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(null, {
                    cookbooks: Object.keys(cookbookList),
                    roles: Object.keys(rolesList)
                });
            });
        });
    };

    this.downloadFactoryItems = function(items, callback) {
        var cookbookCount = 0;
        var roleCount = 0;
        var cookbooks = items.cookbooks;
        var roles = items.roles;

        function downloadCookbook(cookbookName) {
            chef.downloadCookbook(cookbookName, null, function(err) {
                cookbookCount++;
                if (err) {
                    callback(err);
                    return;
                }
                if (cookbooks.length === cookbookCount) {
                    if (roles && roles.length) {
                        downloadRole(roles[roleCount]);
                    } else {
                        callback(null);
                    }
                } else {
                    downloadCookbook(cookbooks[cookbookCount]);
                }
            });
        }

        function downloadRole(roleName, callback) {
            chef.downloadRole(roleName, null, function(err) {
                roleCount++;
                if (err) {
                    callback(err);
                    return;
                }
                if (roles.length === roleCount) {
                    callback(null);
                } else {
                    downloadRole(roles[roleCount]);
                }
            });
        }
        if (cookbooks && cookbooks.length) {
            downloadCookbook(cookbooks[cookbookCount]);
        } else if (roles && roles.length) {
            downloadRole(roles[roleCount]);
        } else {
            callback(null);
        }
    };



};

module.exports = ChefFactory;