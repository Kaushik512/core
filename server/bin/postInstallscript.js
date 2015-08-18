var os = require('os');
var childProcess = require('child_process');
var fs = require('fs');


console.log('Running post installation script');



var shortLinkPath = __dirname + '/../node_modules/_pr';
var osName = os.type();
console.log(osName + ' detected');
console.log('Removing previous shortlink');
fs.unlink(shortLinkPath, function(err) {
    console.log('Creating short links'); 
    var cmd = 'ln -s ../../server ' + shortLinkPath;
    if (osName === 'Windows') {
        cmd = 'mklink /D ' + shortLinkPath + ' ..\\..\\server';
    }

    childProcess.exec(cmd, {
        //cwd: nodeModulesDirPath
    }, function(err, stdout, stderr) {
        if (err) {
            throw err;
            return;
        }
        console.log('post installation script ran successfully');
    });
});