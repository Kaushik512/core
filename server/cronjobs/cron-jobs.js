"use strict"
var fs = require('fs')
var crontab = require('node-crontab');
var logger = require('_pr/logger')(module);


// reading jobs folder

logger.info('loading cron jobs');

var jobDirPath = __dirname+'/jobs';
var jobFiles = fs.readdirSync(jobDirPath);

var jobs = [];

for (let i = 0; i < jobFiles.length; i++) {
	let job = require(jobDirPath + '/' + jobFiles[i]);
	if (job) {
		jobs.push(job);
	}
}


module.exports.start = function start() {
	logger.debug('starting cron jobs');
	for (let i = 0; i < jobs.length; i++) {
		var jobId = crontab.scheduleJob("*/1 * * * *", jobs[i]);
	}
}