var mongoose = require('mongoose');
var uuid = require('node-uuid'); //used for generating unique id

var d4dMastersSchemaNew = new mongoose.Schema({
	id: String,
	name: String,
	masterjson: {data:Object}
},{collection: 'd4dmastersnew'});
var d4dModelNew = mongoose.model('d4dMasterNew', d4dMastersSchemaNew, 'd4dmastersnew');


var d4dMastersOrg = new mongoose.Schema(
	{id: String,
	name: String,
	orgname: String,
	domainname: String,
	description: String,
	rowid:String},{collection:'d4dmastersnew'}
);
var d4dModelMastersOrg = mongoose.model('d4dModelMastersOrg',d4dMastersOrg,'d4dmastersnew');


var d4dMastersProductGroup = new mongoose.Schema(
	{id: String,
	name: String,
	orgname: String,
	orgrowid: String,
	productgroupname: String,
	description: String,
	rowid:String},{collection:'d4dmastersnew'}
);
var d4dModelMastersProductGroup = mongoose.model('d4dModelMastersProductGroup',d4dMastersProductGroup,'d4dmastersnew');


var d4dMastersEnvironments = new mongoose.Schema(
	{id: String,
	name: String,
	orgname: String,
	orgrowid: String,
	environmentname: String,
	description: String,
	rowid:String},{collection:'d4dmastersnew'}
);
var d4dModelMastersEnvironments = mongoose.model('d4dModelMastersEnvironments',d4dMastersEnvironments,'d4dmastersnew');


var d4dMastersProjects = new mongoose.Schema(
	{id: String,
	name: String,
	orgname: String,
	orgrowid: String,
	projectname: String,
	productgroupname: String,
	environmentname: String,
	description: String,
	rowid:String},{collection:'d4dmastersnew'}
);
var d4dModelMastersProjects = mongoose.model('d4dModelMastersProjects',d4dMastersProjects,'d4dmastersnew');

var d4dMastersConfigManagement = new mongoose.Schema(
	{id: String,
	name: String,
	orgname: String,
	orgrowid: String,
	configname: String,
	loginname: String,
	url: String,
	userpemfile_filename: String,
	validatorpemfile_filename: String,
	kniferbfile_filename: String,
	folderpath: String,
	rowid:String},{collection:'d4dmastersnew'}
);
var d4dModelMastersConfigManagement = mongoose.model('d4dModelMastersConfigManagement',d4dMastersConfigManagement,'d4dmastersnew');

var d4dMastersDockerConfig = new mongoose.Schema(
	{id: String,
	name: String,
	dockerreponame: String,
	dockerrepopath: String,
	dockeruserid: String,
	dockeremailid: String,
	dockerpassword: String,
	folderpath: String,
	rowid:String},{collection:'d4dmastersnew'}
);
var d4dModelMastersDockerConfig = mongoose.model('d4dModelMastersDockerConfig',d4dMastersDockerConfig,'d4dmastersnew');



var d4dMastersDesignTemplateTypes = new mongoose.Schema(
	{id: String,
	name: String,
	templatetypename: String,
	designtemplateicon_filename: String,
	rowid:String},{collection:'d4dmastersnew'}
);
var d4dModelMastersDesignTemplateTypes = mongoose.model('d4dModelMastersDesignTemplateTypes',d4dMastersDesignTemplateTypes,'d4dmastersnew');

var d4dMastersTemplatesList = new mongoose.Schema(
	{id: String,
	name: String,
	templatename: String,
	templatesicon_filename: String,
	templatetypename: String,
	dockerreponame: String,
	configname: String,
	dockercontainerpathstitle: String,
	dockercontainerpaths: String,
	templatescookbooks: String,
	rowid:String},{collection:'d4dmastersnew'}
);
var d4dModelMastersTemplatesList = mongoose.model('d4dModelMastersTemplatesList',d4dMastersTemplatesList,'d4dmastersnew');



module.exports = d4dModelNew;
module.exports.d4dModelMastersOrg = d4dModelMastersOrg;
module.exports.d4dModelMastersProductGroup = d4dModelMastersProductGroup;
module.exports.d4dModelMastersEnvironments = d4dModelMastersEnvironments;
module.exports.d4dModelMastersProjects = d4dModelMastersProjects;
module.exports.d4dModelMastersConfigManagement = d4dModelMastersConfigManagement;
module.exports.d4dModelMastersDockerConfig  = d4dModelMastersDockerConfig;
module.exports.d4dModelMastersDesignTemplateTypes  = d4dModelMastersDesignTemplateTypes;
module.exports.d4dModelMastersTemplatesList  = d4dModelMastersTemplatesList;