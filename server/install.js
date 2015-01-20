var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var readline = require('readline');

var userHomeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

function getDefaultsConfig() {
    var config = {
        express: {
            port: 3001,
            express_sid_key: 'express.sid',
            sessionSecret: 'sessionSekret'
        },
        app_run_port: 3001,
        userHomeDir: userHomeDir,
        catalysHomeDirName: 'catalyst',
        instancePemFilesDirName: 'instance-pemfiles',
        tempDirName: 'temp',
        app_run_secure_port: 443,
        cryptoSettings: {
            algorithm: "aes192",
            password: "pass@!@#",
            encryptionEncoding: "ascii",
            decryptionEncoding: "base64",

        },
        chef: {
            chefReposDirName: 'chef-repos',
            defaultChefCookbooks: [],
            ohaiHints: ['ec2'],

            // getter methods
            get chefReposLocation() {
                return config.catalystHome + this.chefReposDirName + '/';
            }
        },
        aws: {
            access_key: "AKIAI6TVFFD23LMBJUPA",
            secret_key: "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",
            region: "us-west-2",
            keyPairName: "catalyst",
            securityGroupId: "sg-c00ee1a5",
            pemFileLocation: __dirname + '/config/',
            pemFile: "catalyst.pem",
            instanceUserName: "root",
            os: [{
                amiid: 'ami-b6bdde86',
                username: 'root',
                osType: 'linux',
                name: 'Cent OS',
                supportedInstanceType: ['t1.micro', 'm1.small', 'm1.medium', 'm1.large', 'm1.xlarge']
            }, {
                amiid: 'ami-21732111',
                username: 'administrator',
                osType: 'windows',
                name: 'Windows 2008',
                supportedInstanceType: ['t2.micro', 'm1.small']
            }, {
                amiid: 'ami-3d50120d',
                username: 'ubuntu',
                osType: 'linux',
                name: 'ubuntu',
                supportedInstanceType: ['t2.micro']
            }]
        },
        db: {
            dbName: 'devops_new',
            host: 'localhost',
            port: '27017'
        },
        ldap: {
            host: '54.187.120.22',
            port: 389

        },

        //getter methods
        get catalystHome() {
            return this.userHomeDir + '/' + this.catalysHomeDirName + '/';
        },

        get instancePemFilesDir() {
            return this.catalystHome + this.instancePemFilesDirName + "/";
        },
        get tempDir() {
            return this.catalystHome + this.tempDirName + "/";
        }

    };

    return config;

}



function readArgs(config) {
    //parsing arguments	
    var cliArgs = require("command-line-args");
    var cli = cliArgs([{
        name: "help",
        alias: "h",
        type: Boolean,
        description: "Help"
    }, {
        name: "catalyst-port",
        type: String,
        description: "Catalyst port number"
    }, {
        name: "catalyst-home",
        type: String,
        description: "catalyst home directory name"
    }, {
        name: "db-host",
        type: String,
        description: "DB Host"
    }, {
        name: "db-port",
        type: String,
        description: "DB Port"
    }, {
        name: "db-name",
        type: String,
        description: "DB Port"
    }, {
        name: "ldap-host",
        type: String,
        description: "Ldap Host"
    }, {
        name: "ldap-port",
        type: String,
        description: "Ldap Host"
    }]);

    var options = cli.parse();

    /* generate a usage guide */
    var usage = cli.getUsage({
        header: "catalyst help",
        footer: "For more information, visit http://www.relevancelab.com"
    });

    if (options.help) {
        console.log(usage);
        return;
    }

    if (options['catalyst-port']) {
        var catalystPort = parseInt(options['catalyst-port']);
        if (catalystPort) {
            config.app_run_port = catalystPort;
            config.express.port = catalystPort;
        }
    }
    config.catalysHomeDirName = options['catalyst-home'] ? options['catalyst-home'] : config.catalysHomeDirName;
    config.db.host = options['db-host'] ? options['db-host'] : config.db.host;
    config.db.port = options['db-port'] ? options['db-port'] : config.db.port;
    config.db.dbName = options['db-name'] ? options['db-name'] : config.db.dbName;
    config.ldap.host = options['ldap-host'] ? options['ldap-host'] : config.ldap.host;
    config.ldap.port = options['ldap-port'] ? options['ldap-port'] : config.ldap.port;

    return config;

}


function installPackageJson() {
    console.log("Installing node packages from pacakge.json");
    var procInstall = spawn('npm', ['install']);
    procInstall.stdout.on('data', function(data) {
        console.log("" + data);
    });

    procInstall.stderr.on('data', function(data) {
        console.log("" + data);
    });
    procInstall.on('close', function(pacakgeInstallRetCode) {
        if (pacakgeInstallRetCode === 0) {
            console.log("Installation Successfull.");
        } else {
            console.log("Error occured while installing packages from package.json");
        }
    });
}


console.log('Installing node packages required for installation');
proc = spawn('npm', ['install', "command-line-args@0.5.3", 'mkdirp@0.5.0', 'fs-extra@0.14.0', 'ldapjs@0.7.1']);
proc.on('close', function(code) {
    if (code !== 0) {
        throw "Unable to install packages"
    } else {
        var defaultConfig = getDefaultsConfig();
        var config = readArgs(defaultConfig);
        if (config) {
            console.log('creating catalyst home directory');

            var mkdirp = require('mkdirp');

            mkdirp.sync(config.catalystHome);
            mkdirp.sync(config.instancePemFilesDir);
            mkdirp.sync(config.tempDir);
            mkdirp.sync(config.chef.chefReposLocation);

            console.log('restoring mongodb');

            var procMongoRestore = spawn('mongorestore', ['--host', config.db.host, '--port', config.db.port, '--db', config.db.dbName, '/WORK/D4D/seed/mongodump/devops_new/']);
            procMongoRestore.on('error', function(mongoRestoreError) {
                console.log("mongorestore error ==> ", mongoRestoreError);
            });
            procMongoRestore.stdout.on('data', function(data) {
                //console.log("" + data);
            });
            procMongoRestore.stderr.on('data', function(data) {
                //console.log("" + data);
            });
            procMongoRestore.on('close', function(mongoRestoreCode) {
                if (mongoRestoreCode === 0) {
                    console.log("Mongorestore Successfull.");

                    var rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout,
                        terminal: true
                    });
                    rl.question("Ldap super user ? ", function(ldapUser) {
                        rl.close();
                        ldapUser = ldapUser.trim();
                        if (!ldapUser) {
                            throw 'Invalid ldap user input'
                        }
                        console.log('Checking for ldap User : ' + ldapUser);
                        var ldapjs = require('ldapjs');
                        var client = ldapjs.createClient({
                            url: 'ldap://' + config.ldap.host + ':' + config.ldap.port
                        });
                        var searchOpts = {
                            // filter: '(cn=' + ldapUser+')',
                            attrsOnly : true
                        };

                        client.search('cn=' + ldapUser + ',dc=d4d-ldap,dc=relevancelab,dc=com', searchOpts, function(err, res) {
                            if (err) {
                                console.log("Unable to preform search in ldap");
                                throw err;
                            }
                            var userFound = false;

                            res.on('searchEntry', function(entry) {
                                console.log('entry: ' + JSON.stringify(entry.object));
                                userFound = true;
                            });
                            res.on('searchReference', function(referral) {
                                console.log('referral: ' + referral.uris.join());
                            });
                            res.on('error', function(err) {
                                console.error('error: ' + err.message);
                            });

                            res.on('end', function(result) {
                                console.log('status: ' + result.status);
                                if (!userFound) {
                                    console.log('Unable to find user ' + ldapUser);
                                    process.exit(1);
                                } else {

                                    fse = require('fs-extra');
                                    console.log('copying seed data');
                                    fse.copy('../seed/catalyst/chef-repos/catalyst_files', config.chef.chefReposLocation + '/catalyst_files', function(err) {
                                        console.log('here');
                                        if (err) {
                                            console.log(err);
                                            console.log('unable to copy seed data');
                                            return;
                                        }

                                    });
                                    console.log('creating configuration json file');
                                    configJson = JSON.stringify(config);
                                    var fs = require('fs');
                                    fs.writeFileSync('config/catalyst-config.json', configJson);
                                    installPackageJson();

                                }

                            });
                        });

                    });

                } else {
                    console.log("Error in restoring mongodb");
                }
            });


        }

    }
});

proc.stdout.on('data', function(data) {
    console.log("" + data);
});

proc.stderr.on('data', function(data) {
    console.log("" + data);
});