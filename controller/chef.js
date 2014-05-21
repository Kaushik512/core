var ChefApi = require("chef-api");
var Process = require("./utils/process");
var fileIo = require('./fileio');

var Chef = function(settings) {

	var that = this;
	var chefApi = new ChefApi();
	chefApi.config({
		user_name: settings.chefUserName,
		key_path: settings.chefReposLocation + settings.chefUserName + "/.chef/" + settings.chefUserPemFile,
		url: settings.hostedChefUrl
	});

	this.getHostedChefCookbooks = function(callback) {
		if (typeof callback !== 'function') {
			return;
		}
		chefApi.getCookbooks(null, function(err, res) {
			if (err)
				callback(err, null);

			var keys = Object.keys(res);
			keys.sort(function(a, b) {
				if (a < b) {
					return -1;
				} else if (a > b) {
					return 1;
				} else {
					return 0;
				}
			});
			callback(null, keys);
		});

	};

	this.downloadCookbooks = function(callback) {
		var proc = new Process('knife', ['download', 'cookbooks'], {
			cwd: settings.chefReposLocation + settings.userChefRepoName,
			onError: function(err) {
				callback(err);
			},
			onClose: function(code) {
				callback(null, code);
			}
		});
		proc.start();
	};

	this.uploadCookbook = function(cookbookName, callback) {
		var proc = new Process('knife', ['cookbook', 'upload', cookbookName], {
			cwd: settings.chefReposLocation + settings.userChefRepoName,
			onError: function(err) {
				callback(err, null);
			},
			onClose: function(code) {
				callback(null, code);
			}
		});
		proc.start();
	}


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

	this.getCookbookData = function(path, callback) {
		path = fixPath(path);
		var rootDir = settings.chefReposLocation + settings.userChefRepoName + '/cookbooks/'
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
					if (settings) {
						chefUserName = settings.chefUserName
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
			fileIo.writeFile(settings.chefReposLocation + settings.userChefRepoName + '/cookbooks/' + filePath, fileContent, 'utf-8', function(err) {
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
					that.uploadCookbook(cookbookName, function(err) {
						if (err) {
							callback(err);
						} else {
							callback(null);
						}
					});
				} else {
					callback("Invalid cookbook name");
				}
			});
		} else {
			callback("invalid file", null);
		}
	}


	this.downloadRoles = function(callback) {
		var proc = new Process('knife', ['download', 'roles'], {
			cwd: settings.chefReposLocation + settings.userChefRepoName,
			onError: function(err) {
				callback(err);
			},
			onClose: function(code) {
				callback(null, code);
			}
		});
		proc.start();
	};

	this.uploadRoles = function(callback) {
		var proc = new Process('knife', ['upload', 'roles'], {
			cwd: settings.chefReposLocation + settings.userChefRepoName,
			onError: function(err) {
				callback(err, null);
			},
			onClose: function(code) {
				callback(null, code);
			}
		});
		proc.start();
	}


	this.getRoleData = function(path, callback) {
		path = fixPath(path);
		var rootDir = settings.chefReposLocation + settings.userChefRepoName + '/roles/'
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
					if (settings) {
						chefUserName = settings.chefUserName
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
			fileIo.writeFile(settings.chefReposLocation + settings.userChefRepoName + '/roles/' + filePath, fileContent, 'utf-8', function(err) {
				if (err) {
					callback(err, null);
					return;
				}
				that.uploadRoles(function(err) {
					if (err) {
						callback(err);
					} else {
						callback(null);
					}
				});
			});
		} else {
			callback("invalid file", null);
		}
	};


	this.bootstrapInstance = function(params, callback, callbackOnStdOut, callbackOnStdErr) {
		var options = {
			cwd: settings.chefReposLocation + settings.userChefRepoName,
			onError: function(err) {
				callback(err, null);
			},
			onClose: function(code) {
				callback(null, code);
			}
		};
		if (typeof callbackOnStdOut === 'function') {
			options.onStdOut = function(data) {
				callbackOnStdOut(data);
			}
		}

		if (typeof callbackOnStdErr === 'function') {
			options.onStdErr = function(data) {
				callbackOnStdErr(data);
			}
		}
		if((!(params.runList) || !params.runList.length)) {
			params.runList = [' '];

		}

		var proc = new Process('knife', ['bootstrap', params.instanceIp, '-i' + params.pemFilePath, '-r' + params.runList.join(), '-x' + params.instanceUserName], options);
		proc.start();
	}

}

module.exports = Chef;