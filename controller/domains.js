var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/devops');

var Schema = mongoose.Schema;

var DomainsSchema = new Schema({
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


var Domains = mongoose.model('domains', DomainsSchema);


module.exports.createDomainDocument = function(domainName,pid,callback){
  var domain = new Domains({ domainName: domainName,domainPid:pid});
   domain.save(function(err,data){
      if(err) {
        callback(err,null);
        return;
      } 
      console.log("Domain Document Created");
      callback(null,data);
    }); 
}

module.exports.getDomainData = function(domainName,callback) {
  Domains.find({domainName:domainName},function(err,data){
    if(err) {
      callback(err,null);
      return;
    }
    callback(null,data);
  });
 
};

module.exports.getAllDomainData = function(pid,callback){
  Domains.find({domainPid:pid},function(err,data){
    if(err){
      callback(err,null);
      return;
    }
    callback(null,data);
  });
}


module.exports.saveDomainInstanceDetails = function(domainName,instanceList,callback) {

   Domains.update({domainName:domainName},{$pushAll: {domainInstances:instanceList}},{upsert:true},function(err,data){

    if(err){
      callback(err,null);
      return;
    } 
    callback(null,data);

  });
  
};

module.exports.updateInstanceStatus = function(domainName,instanceId,status,callback) {
   Domains.update({domainName:domainName,"domainInstances.instanceId":instanceId},{$set: {"domainInstances.$.instanceActive":status}},{upsert:false},function(err,data){

    if(err){
      callback(err,null);
      return;
    } 
    callback(null,data);

  });
}

module.exports.deleteEmptyDomains = function(callback) {

}



