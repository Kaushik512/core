var readline = require('readline');

//finding user home directory
var userHomeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

function getDefaultsConfig() {
    var pathExtra = require('path-extra');
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


var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

rl.setPrompt('catalyst-cli');

var config = getDefaultsConfig();

//home directory??
rl.question("Catalyst home directory name?", function(homeDirectoryName) {
    homeDirectoryName = homeDirectoryName.trim();
    if (homeDirectoryName) {
        config.catalysHomeDirName = homeDirectoryName ? homeDirectoryName : config.catalysHomeDirName;
    }
});

// catalyst port
rl.question("Catalyst port number?", function(port) {
    port = port.trim();
    port = parseInt(port);
    if (catalystPort) {
        config.app_run_port = port;
        config.express.port = port;
    }
});