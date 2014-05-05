var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/devops');

var Schema = mongoose.Schema;

var AppFactoryBlueprintSchema = new Schema({
  domainName:String,
  domainPid:Number,
  domainInstances : [{
  instanceId :  String,
  instanceIP : String,
  instanceRole: String,
  instanceActive:Boolean,
  bootStrapStatus:Boolean,
  runlist : [String],
  }]
});
