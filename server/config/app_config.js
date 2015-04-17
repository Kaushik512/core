var pathExtra = require('path-extra');
var mkdirp = require('mkdirp');
var fs = require('fs');
var currentDirectory = __dirname;
var path = require('path');
var logger = require('../lib/logger')(module);


var configJson;
try {
    configJson = fs.readFileSync('./config/catalyst-config.json', {
        'encoding': 'utf8'
    });
} catch (err) {
    console.log(err);
    configJson = null;
}



var config = {
    express: {
        port: 3004,
        express_sid_key: 'express.sid',
        sessionSecret: 'sessionSekret'
    },
    app_run_port: 3001,
    catalystDataDir: currentDirectory + '/catdata',
    catalysHomeDirName: 'catalyst',
    instancePemFilesDirName: 'instance-pemfiles',
    tempDirName: 'temp',
    cookbooksDirName: 'cookbooks',
    app_run_secure_port: 443,
    cryptoSettings: {
        algorithm: "aes192",
        password: "pass@!@#",
        encryptionEncoding: "ascii",
        decryptionEncoding: "base64",

    },
    chef: {
        chefReposDirName: 'chef-repos',
        cookbooksDirName: 'cookbooks',
        defaultChefCookbooks: [],
        ohaiHints: ['ec2'],
        attributeExtractorCookbookName: 'attrib',

        // getter methods
        get chefReposLocation() {
            return config.catalystHome + this.chefReposDirName + '/';
        },
        get cookbooksDir() {
            return config.catalystHome + this.cookbooksDirName + "/";
        }
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
        }],
        virtualizationType: [{
            hvm: ['t2.micro', 't2.small', 't2.medium', 'm3.medium', 'm3.large', 'm3.xlarge', 'm3.2xlarge',
                'c3.large', 'c3.xlarge', 'c3.2xlarge', 'c3.4xlarge', 'c3.8xlarge', 'c4.large', 'c4.xlarge',
                'c4.2xlarge', 'c4.4xlarge', 'c4.8xlarge', 'r3.large', 'r3.xlarge', 'r3.2xlarge', 'r3.4xlarge',
                'r3.8xlarge', 'i2.xlarge', 'i2.2xlarge', 'i2.4xlarge', 'i2.8xlarge', 'hs1.8xlarge'
            ]
        }, {
            paravirtual: ['t1.micro', 'm1.small', 'm1.medium', 'm1.large', 'm1.xlarge','m3.medium', 'm3.large', 'm3.xlarge', 'm3.2xlarge', 'c3.large', 'c3.xlarge', 'c3.2xlarge',
                'c3.4xlarge', 'c3.8xlarge', 'hs1.8xlarge'
            ]
        }],

        regions: [{

            region_name: "US East (N. Virginia)",
            region: "us-east-1"
        }, {
            region_name: "US West (Oregon)",
            region: "us-west-2"
        }, {
            region_name: "US West (N. California)",
            region: "us-west-1"
        }, {
            region_name: "EU (Ireland)",
            region: "eu-west-1"
        }, {
            region_name: "EU (Frankfurt)",
            region: "eu-central-1"
        }, {
            region_name: "Asia Pacific (Singapore)",
            region: "ap-southeast-1"
        }, {
            region_name: "Asia Pacific (Sydney)",
            region: "ap-southeast-2"
        }, {
            region_name: "Asia Pacific (Tokyo)",
            region: "ap-northeast-1"
        }, {
            region_name: "South America (Sao Paulo)",
            region: "sa-east-1"
        }],
        operatingSystems: [{

            os_name: "Cent OS",
            osType: "linux"
        }, {

            os_name: "Windows 2008",
            osType: "windows"
        }, {

            os_name: "Ubuntu",
            osType: "linux"
        }]
    },
    db: {
        dbName: 'devops_new',
        host: 'localhost',
        port: '27017'
    },
    ldap: {
        host: '54.149.26.254',
        port: 389,
        rootuser: 'Admin',
        rootpass: 'ReleV@ance'

    },

    features: {
        appcard: true
    },

    //getter methods
    get catalystHome() {
        return this.catalystDataDir + '/' + this.catalysHomeDirName + '/';
    },

    get instancePemFilesDir() {
        return this.catalystHome + this.instancePemFilesDirName + "/";
    },
    get tempDir() {
        return this.catalystHome + this.tempDirName + "/";
    }
};

//creating path
mkdirp.sync(config.catalystHome);
mkdirp.sync(config.instancePemFilesDir);
mkdirp.sync(config.tempDir);
mkdirp.sync(config.chef.cookbooksDir);

var chefRepoLocation = mkdirp.sync(config.chef.chefReposLocation);
logger.debug('chef repo location ==>', config.chef.chefReposLocation);


if (configJson) {
    config = JSON.parse(configJson);
    //console.log(config);
} else {
    //console.log(configJson);
}


module.exports = config;