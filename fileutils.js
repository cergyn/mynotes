const fs = require('fs');
const path = require('path');

function checkDirectory(dirName){
    fs.mkdir(path.join(__dirname, dirName), 0o744, function(err) {
        if ((err != null) && (err.code == 'EEXIST'))
        {
            console.log(`Directory "${dirName}" exists`);
            return;
        }
            
        if (err) throw err;
    });    
}

exports.checkDirectory = checkDirectory;
