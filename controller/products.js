var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/devops');

var Schema = mongoose.Schema;

var roleSchema = new Schema({
  name:  String,
  pid: Number,
  status:Boolean,
  components : [{
       cid : Number,
       title : String,
       amiid:String,
       description : String,
       runlist : [String],
       sizing : {
             CPU: String,
             RAM:String,
             HDD:String,
        }
   }],
});


var roles = mongoose.model('roles', roleSchema);



module.exports.getProducts = function(callback) {
  console.log('now i m here');
  roles.find({},'name pid status',function(err,data) {
      
       if(err) {
         console.log("error");
         callback("error",null);
       } else {
         data.sort(function(a,b){
           return a.pid-b.pid;
         });         
         callback(null,data);
       }
  });
}

module.exports.getProductComponents = function(pid,callback) {
  roles.find({pid:pid},function(err,data) {
      
       if(err) {
         console.log("error");
         callback("error",null);
       } else {
       //console.log(data);
       callback(null,data[0]);
       }
  }); 
} 

module.exports.setProductStatus = function(pidList,callback) {
  
  if(!pidList) {
    pidList = [];
  }
  pidList = [].concat(pidList);

  for(var i=0;i<pidList.length;i++) {
    pidList[i] = parseInt(pidList[i]);
  }
  console.log(pidList);
  roles.update({pid:{$in:pidList}},{$set: {status:true}},{upsert:false, multi: true},function(err,data){
    if(err) {
      console.log(err);
      callback(err);
      return;
    }
    console.log(data); 
    roles.update({pid:{$nin:pidList}},{$set: {status:false}},{upsert:false,multi: true},function(err,data){
     if(err){
      console.log(err);
      callback(err);
      return;
     }
      console.log(data); 
     callback(null,data);
    });
  });

}
