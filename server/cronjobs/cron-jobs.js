"use strict"
var fs = require('fs')
var crontab = require('node-crontab');
//var appConfig = require('_pr/config');
var logger = require('_pr/logger')(module);


// reading jobs folder

logger.info('loading cron jobs');

var jobDirPath = __dirname + '/jobs';
var jobFiles = fs.readdirSync(jobDirPath);

var jobs = [];

for (let i = 0; i < jobFiles.length; i++) {
	let job = require(jobDirPath + '/' + jobFiles[i]);
	if (job) {
		jobs.push(job);
	}
}

//var timeDelay = appConfig.cronjobTimeDelay || "* * * * * *";



module.exports.start = function start() {
	//logger.info('starting cron job with delay ==> '+timeDelay);
	for (let i = 0; i < jobs.length; i++) {
		var jobId = crontab.scheduleJob("*/2 * * * *", jobs[i]);
	}
}