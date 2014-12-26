var java = require('java');

//java.classpath.push(['/home/anshul/eclipse-workspace/catalyst-ssh/bin', '../java/lib']);
//java.classpath.push(['../java/classes', '../java/lib']);

java.classpath.push('../java/lib/jsch-0.1.51.jar');
java.classpath.push('/home/anshul/eclipse-workspace/catalyst-ssh/bin');


/*
var javaSSH = java.import('com.relevancelab.catalyst.security.ssh.SSH');
javaSSH.testMethodStaticSync();
*/


//Creating new instance of JAVA SSH
console.log('Initializing class');
java.newInstance('com.relevancelab.catalyst.security.ssh.SSH', '54.69.140.241', 22, 'root', null, '/WORK/D4D/config/catalyst.pem', function(err, javaSSH) {
    console.log('in callback');
    if (err) {
        console.log(err);
        return;
    }
    java.callMethod(javaSSH,'execChefClient', 'recipe[server_time]',true, function(err,retCode){
       if(err) {
       	console.log("error in runnnig method");
       	console.log(err);
       	return;
       }
       console.log("success in runnnig method");
       console.log(retCode);

    })
    //console.log('success');
});

