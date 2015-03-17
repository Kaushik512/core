var logger = require('../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;


var taskTypeSchema = require('./taskTypeSchema');


var chefTaskSchema = taskTypeSchema.extend({
    nodeIds: [String],
    runlist: [String]
});

//Instance Methods :- getNodes
chefTaskSchema.methods.getNodes = function() {

};

// Instance Method :- run task
chefTaskSchema.methods.execute = function() {

};

var ChefTask = mongoose.model('chefTask', chefTaskSchema);

module.exports = ChefTask;