var pathExtra = require('path-extra');
var mkdirp = require('mkdirp');

var homeDirectory = pathExtra.homedir();
var currentDirectory = __dirname;

var catalysHomeDirName = "catalyst";

console.log('homeDirectory ==>', homeDirectory);


//creating path

mkdirp.sync(homeDirectory + '/' + catalysHomeDirName + '/');
mkdirp.sync(homeDirectory + '/' + catalysHomeDirName + '/instance-pemfiles/');
mkdirp.sync(homeDirectory + '/' + catalysHomeDirName + '/temp/');


var config = {
    app_run_port: 3001,
    settingsDir: homeDirectory + '/' + catalysHomeDirName + '/',
    instancePemFilesDir: homeDirectory + "/" + catalysHomeDirName + "/instance-pemfiles/",
    tempDir: homeDirectory + "/" + catalysHomeDirName + "/temp/",
    app_run_secure_port: 443,
    cryptoSettings: {
        algorithm: "aes192",
        password: "pass@!@#",
        encryptionEncoding: "ascii",
        decryptionEncoding: "base64",

    },
    aws: {
        access_key: "AKIAI6TVFFD23LMBJUPA",
        secret_key: "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",
        region: "us-west-2",
        keyPairName: "catalyst",
        securityGroupId: "sg-c00ee1a5",
        pemFileLocation: currentDirectory + '/',
        pemFile: "catalyst.pem",
        instanceUserName: "root",
        os: [{
            amiid: 'ami-b6bdde86',
            username: 'root',
            osType: 'linux',
            name: 'Cent OS',
            supportedInstanceType: ['t1.micro', 'm1.small', 'm1.medium', 'm1.large', 'm1.xlarge']
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

    }

};


module.exports = config;