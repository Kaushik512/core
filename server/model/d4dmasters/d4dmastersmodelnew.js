var mongoose = require('mongoose');
var uuid = require('node-uuid'); //used for generating unique id
var validate = require('mongoose-validator');
var logger  = require('../../lib/logger')(module);

var extend = require('mongoose-validator').extend;
extend('is_ValidName', function (val) {
    var pattern = /^[a-zA-Z0-9-_]+$/;	
    return pattern.test(val);
}, 'Name can contain alphabets, numbers,dash, underscore');

extend('isValidDesc', function (val) {
    var pattern = /^[a-zA-Z0-9-_.,\s]+$/;
    return pattern.test(val);
}, 'Name can contain alphabets, numbers,dash, underscore');

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 15],
    message: 'Name should be between 1 and 15 characters'
  }),
  validate({
    validator: 'is_ValidName',
    passIfEmpty: true,
    message: 'Name can contain alphabets, numbers,dash, underscore, dot'
  })
];

var descValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 140],
    message: 'Name should be between 0 and 140 characters'
  }),
  validate({
    validator: 'isValidDesc',
    passIfEmpty: true,
    message: 'Name can contain alphabets, numbers,dash, underscore, dot or a space'
  })
];

var d4dMastersSchemaNew = new mongoose.Schema({
	id: {type:String,required:true, trim:true},
	name: {type:String,trim:true},
	masterjson: {data:Object}
},{collection: 'd4dmastersnew'});
var d4dModelNew = mongoose.model('d4dMasterNew', d4dMastersSchemaNew, 'd4dmastersnew');

var d4dMastersOrg = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	name: {type:String,trim:true, validate:nameValidator},
	orgname: {type:String,required:true, trim:true, validate:nameValidator},
	domainname: {type:String, trim:true},
	description: {type:String, trim:true},
	active: {type:Boolean, trim:true,default:true},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersOrg = mongoose.model('d4dModelMastersOrg',d4dMastersOrg,'d4dmastersnew');


var d4dMastersProductGroup = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	name: {type:String,trim:true, validate:nameValidator},
	orgname: {type:String,required:true, trim:true},
	orgname_rowid: {type:String, trim:true},
	productgroupname: {type:String,required:true, trim:true, validate:nameValidator},
	description: {type:String, trim:true, validate:descValidator},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersProductGroup = mongoose.model('d4dModelMastersProductGroup',d4dMastersProductGroup,'d4dmastersnew');


var d4dMastersEnvironments = new mongoose.Schema(
	{id: {type:String, trim:true},
	name: {type:String,trim:true},
	orgname: {type:String,required:false, trim:true},
	orgname_rowid: {type:String, trim:true},
	environmentname: {type:String,required:true, trim:true, validate:nameValidator},
	description: {type:String, trim:true, validate:descValidator},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersEnvironments = mongoose.model('d4dModelMastersEnvironments',d4dMastersEnvironments,'d4dmastersnew');


var d4dMastersProjects = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	name: {type:String,trim:true, validate:nameValidator},
	orgname: {type:String,required:false, trim:true},
	orgname_rowid: {type:String, trim:true},
	projectname: {type:String, trim:true, validate:nameValidator},
	productgroupname: {type:String, trim:true},
	productgroupname_rowid: {type:String, trim:true},
	environmentname: {type:String, trim:true},
	environmentname_rowid: {type:String, trim:true},
	description: {type:String, trim:true, validate:descValidator},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersProjects = mongoose.model('d4dModelMastersProjects',d4dMastersProjects,'d4dmastersnew');

var d4dMastersConfigManagement = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	name: {type:String,trim:true, validate:nameValidator},
	orgname: {type:String,required:true, trim:true, validate:nameValidator},
	orgname_rowid: {type:String, trim:true},
	orgrowid: {type:String, trim:true},
	configname: {type:String,required:true, trim:true},
	loginname: {type:String,required:true, trim:true},
	url: {type:String, trim:true},
	userpemfile_filename: {type:String, trim:true},
	validatorpemfile_filename: {type:String, trim:true},
	kniferbfile_filename: {type:String, trim:true},
	folderpath: {type:String, trim:true},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersConfigManagement = mongoose.model('d4dModelMastersConfigManagement',d4dMastersConfigManagement,'d4dmastersnew');

var d4dMastersDockerConfig = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	name: {type:String,trim:true, validate:nameValidator},
	dockerreponame: {type:String,required:true, trim:true, validate:nameValidator},
	dockerrepopath: {type:String,required:true, trim:true},
	dockeruserid: {type:String,required:true, trim:true},
	dockeremailid: {type:String, trim:true},
	dockerpassword: {type:String,required:true, trim:true},
	folderpath: {type:String,trim:true},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersDockerConfig = mongoose.model('d4dModelMastersDockerConfig',d4dMastersDockerConfig,'d4dmastersnew');


var d4dMastersUsers = new mongoose.Schema(
	{id: {type:String, trim:true},
	loginname: {type:String, trim:true, validate:nameValidator},
	email: {type:String, trim:true},
	userrolename: {type:String, trim:true},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersUsers = mongoose.model('d4dModelMastersUsers',d4dMastersUsers,'d4dmastersnew');

var d4dMastersUserroles = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	userrolename: {type:String,required:true, trim:true, validate:nameValidator},
	description: {type:String,required:true, trim:true, validate:descValidator},
	globalaccessname: {type:String,required:true, trim:true, validate:nameValidator},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersUserroles = mongoose.model('d4dModelMastersUserroles',d4dMastersUserroles,'d4dmastersnew');



var d4dMastersDesignTemplateTypes = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	name: {type:String,required:true, trim:true, validate:nameValidator},
	templatetypename: {type:String,required:true, trim:true, validate:nameValidator},
	designtemplateicon_filename: {type:String,required:true, trim:true},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersDesignTemplateTypes = mongoose.model('d4dModelMastersDesignTemplateTypes',d4dMastersDesignTemplateTypes,'d4dmastersnew');

var d4dMastersTemplatesList = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	name: {type:String, trim:true},
	templatename: {type:String, trim:true},
	templatesicon_filename: {type:String, trim:true},
	templatetypename: {type:String, trim:true},
	dockerreponame: {type:String, trim:true},
	configname: {type:String, trim:true},
	configname_rowid: {type:String, trim:true},
	dockercontainerpathstitle: {type:String, trim:true},
	dockercontainerpaths: {type:String, trim:true},
	templatescookbooks: {type:String, trim:true},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersTemplatesList = mongoose.model('d4dModelMastersTemplatesList',d4dMastersTemplatesList,'d4dmastersnew');


var d4dMastersServicecommands = new mongoose.Schema(
	{id: {type:String, trim:true},
	name: {type:String, trim:true},
	servicename: {type:String, trim:true, validate:nameValidator},
	commandname: {type:String, trim:true},
	commandtype: {type:String, trim:true},
	configname: {type:String, trim:true},
	configname_rowid: {type:String, trim:true},
	chefserverid: {type:String, trim:true},
	operatingsystem: {type:String, trim:true},
	servicecookbook: {type:String, trim:true},
	servicestart: {type:String, trim:true},
	servicestop: {type:String, trim:true},
	servicerestart: {type:String, trim:true},
	servicestatus: {type:String, trim:true},
	servicekill: {type:String, trim:true},
	command: {type:String, trim:true},
	commandaction: {type:String, trim:true},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersServicecommands = mongoose.model('d4dModelMastersServicecommands',d4dMastersServicecommands,'d4dmastersnew');

var d4dMastersglobalaccess = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	globalaccessname: {type:String,required:true, trim:true, validate:nameValidator},
	files: {type:String,required:true, trim:true},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelMastersglobalaccess = mongoose.model('d4dModelMastersglobalaccess',d4dMastersglobalaccess,'d4dmastersnew');

var d4dMastersJenkinsConfig = new mongoose.Schema(
	{id: {type:String,required:true, trim:true},
	jenkinsname: {type:String,required:true, trim:true, validate:nameValidator},
	jenkinsurl: {type:String,required:true, trim:true},
	jenkinsusername: {type:String,required:true, trim:true, validate:nameValidator},
	jenkinspassword: {type:String,required:true, trim:true},
	jenkinstoken: {type:String, trim:true},
	folderpath: {type:String, trim:true},
	rowid:{type:String,required:true, trim:true}},{collection:'d4dmastersnew'}
);
var d4dModelJenkinsConfig = mongoose.model('d4dModelJenkinsConfig',d4dMastersJenkinsConfig,'d4dmastersnew');


module.exports = d4dModelNew;
module.exports.d4dModelMastersOrg = d4dModelMastersOrg;
module.exports.d4dModelMastersProductGroup = d4dModelMastersProductGroup;
module.exports.d4dModelMastersEnvironments = d4dModelMastersEnvironments;
module.exports.d4dModelMastersProjects = d4dModelMastersProjects;
module.exports.d4dModelMastersConfigManagement = d4dModelMastersConfigManagement;
module.exports.d4dModelMastersDockerConfig  = d4dModelMastersDockerConfig;
module.exports.d4dModelMastersDesignTemplateTypes  = d4dModelMastersDesignTemplateTypes;
module.exports.d4dModelMastersTemplatesList  = d4dModelMastersTemplatesList;
module.exports.d4dModelMastersServicecommands  = d4dModelMastersServicecommands; 
module.exports.d4dModelMastersUsers  = d4dModelMastersUsers;
module.exports.d4dModelMastersUserroles  = d4dModelMastersUserroles;
module.exports.d4dModelMastersglobalaccess  = d4dModelMastersglobalaccess;
module.exports.d4dModelJenkinsConfig  = d4dModelJenkinsConfig;