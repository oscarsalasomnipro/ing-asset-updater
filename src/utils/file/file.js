const path = require('path')
const fs = require('fs')

function isFilePath(filePath) {
    
    try {

        if (typeof filePath !== 'string') {
            return false;
        }

        filePath = filePath.trim()

        if (filePath === '') {
            return false;
        }

        if (!path.isAbsolute(filePath)) {
            return false;
        }

        if (!fs.existsSync(filePath)) {
            return false;
        }

        if (!fs.statSync(filePath).isFile()) {
            return false;
        }

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

}

function getAllFilesPaths(folderPath) {

    let allFilesPaths = []

    try {

        if (typeof folderPath !== 'string') {
            return allFilesPaths
        }

        folderPath = folderPath.trim()

        if (folderPath === '') {
            return allFilesPaths
        }

        if (!path.isAbsolute(folderPath)) {
            return allFilesPaths
        }

        if (!fs.existsSync(folderPath)) {
            return allFilesPaths
        }

        if (!fs.lstatSync(folderPath).isDirectory()) {
            return allFilesPaths
        }

        let elementsInDirectory = fs.readdirSync(folderPath)

        elementsInDirectory.forEach(elementInDirectory => {

            elementInDirectory = path.join(folderPath, elementInDirectory)

            if (fs.lstatSync(elementInDirectory).isFile()) {

                allFilesPaths.push(path.resolve(elementInDirectory))

            } else if (fs.lstatSync(elementInDirectory).isDirectory()) {

                allFilesPaths = allFilesPaths.concat(getAllFilesPaths(elementInDirectory))

            }

        })

        return allFilesPaths

    } catch (error) {

        console.error(error)

        return allFilesPaths

    }

}

module.exports = {
    isFilePath,
    getAllFilesPaths
}