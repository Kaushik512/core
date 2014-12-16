var pathExtra = require('path-extra');
var mkdirp = require('mkdirp');

var homeDirectory = pathExtra.homedir();
var currentDirectory = __dirname;

console.log('homeDirectory ==>', homeDirectory);


//creating path

mkdirp.sync(homeDirectory + '/catalyst/');
mkdirp.sync(homeDirectory + '/catalyst/instance-pemfiles/');
mkdirp.sync(homeDirectory + '/catalyst/temp/');


module.exports = {
    "app_run_port": 3000,
    "settingsDir": homeDirectory + '/catalyst/',
    "instancePemFilesDir": homeDirectory + "/catalyst/instance-pemfiles/",
    "tempDir": homeDirectory + "/catalyst/temp/",
    "app_run_secure_port": 443,
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
            name: 'Cent OS'
        }, {
            amiid: 'ami-b5a7ea85',
            username: 'ubuntu',
            osType: 'linux',
            name: 'ubuntu'
        }]
    }

}