var os = require('os');
var childProcess = require('child_process');


console.log('Running post installation script');

console.log('Creating short links');

var osName = os.type();
console.log(osName + ' detected');

var cmd = 'ln -s ../server _';
if (osName === 'Windows') {
    cmd = 'mklink /D _ ..\\server';
}

var nodeModulesDirPath = __dirname + '/../node_modules';
console.log(nodeModulesDirPath);

childProcess.exec(cmd, {
    cwd: nodeModulesDirPath
}, function(err, stdout, stderr) {
    if (err) {
        throw err;
        return;
    }
    console.log('post installation script ran successfully');
});