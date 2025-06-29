const path = require('path')
const fs = require('fs')

function isFolderPath(folderPath) {

    try {

        if (typeof folderPath !== 'string') {
            return false;
        }

        folderPath = folderPath.trim()

        if (folderPath === '') {
            return false;
        }

        if (!path.isAbsolute(folderPath)) {
            return false;
        }

        if (!fs.existsSync(folderPath)) {
            return false;
        }

        if (!fs.statSync(folderPath).isDirectory()) {
            return false;
        }

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

}

module.exports = {
    isFolderPath
}