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



module.exports = d4dModelNew;
module.exports.d4dModelMastersOrg = d4dModelMastersOrg;
module.exports.d4dModelMastersProductGroup = d4dModelMastersProductGroup;