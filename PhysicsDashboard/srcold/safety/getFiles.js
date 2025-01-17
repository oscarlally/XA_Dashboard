const fs = require('fs');
const path = require('path');

function getFiles(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                reject(err);
                return;
            }

            // Filter out files with the name ".DS_Store"
            const validFiles = files.filter(file => file !== '.DS_Store');

            // Map each filename to its full path
            const fullFilePaths = validFiles.map(file => path.join(directoryPath, file));

            resolve(fullFilePaths);
        });
    });
}


module.exports = { getFiles };


