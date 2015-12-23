/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var taskStatusDao = require('./dao/taskstatusdao');
var logger = require('_pr/logger')(module);

function TaskStatusClass(taskId) {

    this.updateTaskStatus = function(status, callback) {
        var timestampUpdated = new Date().getTime();
        taskStatusDao.updateTaskStatus(taskId, {
            timestampUpdated: timestampUpdated,
            statusObj: {
                timestamp: timestampUpdated,
                status: status
            }
        }, function(err, data) {
            if (err) {
                logger.debug('unable to update taskstatus', err);
                if (typeof callback === 'function') {
                    callback(err, null);
                }
                return;
            }
            if (typeof callback === 'function') {
                callback(null, true);
            }
        });
    };

    this.endTaskStatus = function(successful, status, callback) {
        var timestamp = new Date().getTime();
        var updateObj = {
            timestampUpdated: timestamp,
            timestampEnded: timestamp,
            completed: true,
            successful: successful

        }
        if (status) {
            updateObj.statusObj = {
                timestamp: timestamp,
                status: status
            }
        }
        taskStatusDao.updateTaskStatus(taskId, updateObj, function(err, data) {
            if (err) {
                logger.debug('unable to update taskstatus', err);
                if (typeof callback === 'function') {
                    callback(err, null);
                }
                return;
            }
            if (typeof callback === 'function') {
                callback(null, true);
            }
        });

    };

    this.getStatusByTimestamp = function(timestamp, callback) {

        taskStatusDao.getTaskStatusById(taskId, function(err, taskStatus) {
            if (err) {
                logger.debug('unable to get taskstatus', err);
                if (typeof callback === 'function') {
                    callback(err, null);
                }
                return;
            }
            if (!taskStatus.length) {
                callback(null, null);
                return;
            } else {
                callback(null, taskStatus[0]);
            }
        });
    };

    this.getTaskId = function() {
        return taskId;
    }
}

function createNewTask(callback) {
    taskStatusDao.createTaskStatus({
        timestampStarted: new Date().getTime(),
        completed: false,
        successful: false,
    }, function(err, data) {
        if (err) {
            logger.debug(err);
            callback(err, null);
            return
        }
        logger.debug(data);
        callback(null, new TaskStatusClass(data._id));
    });
}

module.exports.getTaskStatus = function(taskId, callback) {
    if (taskId) {
        callback(null, new TaskStatusClass(taskId));
    } else {
        createNewTask(callback);
    }
};
