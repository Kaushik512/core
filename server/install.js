var spawn = require('child_process').spawn,
    child;


proc = spawn('npm', ['install']);
proc.on('close', function(code) {
    if(code === 0) {
        console.log("Npm installed successfully");
    } else {
    	console.log('unable to run process');
    }
});

proc.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

proc.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});
