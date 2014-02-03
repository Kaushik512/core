var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/devops');

var Schema = mongoose.Schema;

var DomainsSchema = new Schema({
  domainName:String,
  domainsInstaces : [{
  instanceId :  String,
  instanceIP : String,
  instanceRole: String,
  instanceActive:Boolean,
  bootStrapStatus:Boolean,
  runlist : [String],
  }]
});


var Domains = mongoose.model('domains', DomainsSchema);


module.exports.createDomainDocument = function(domainName,callback){
  var domain = new Domains({ domainName: domainName });
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

module.exports.getAllDomainData = function(callback){
  Domains.find(function(err,data){
    if(err){
      callback(err,null);
      return;
    }
    callback(null,data);
  });
}


module.exports.saveDomainInstanceDetails = function(domainName,instanceList,callback) {

   Domains.update({domainName:domainName},{$pushAll: {domainsInstaces:instanceList}},{upsert:true},function(err,data){

    if(err){
      callback(err,null);
      return;
    } 
    callback(null,data);

  });
  
};

module.exports.deleteEmptyDomains = function(callback) {

}



