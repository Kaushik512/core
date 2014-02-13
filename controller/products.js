var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/devops');

var Schema = mongoose.Schema;

var roleSchema = new Schema({
  name:  String,
  pid: Number,
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
  roles.find({},'name pid',function(err,data) {
      
       if(err) {
         console.log("error");
         callback("error",null);
       } else {
         console.log(data);
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
