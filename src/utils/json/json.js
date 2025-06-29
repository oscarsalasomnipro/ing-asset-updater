const path = require("path");
const fs = require("fs");
const lodash = require("lodash")

function isJSONFilePath(filePath) {
    
    try {

        if (typeof filePath !== "string") {
            return false;
        }

        if (filePath.trim() === "") {
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

        if (path.extname(filePath) !== ".json") {
            return false;
        }

        return true;

    } catch (error) {

        console.error(error);

        return false;
    
    }

}

function getJSONFile(jsonFilePath) {
    
    let jsonFile = {};

    try {
        
        if (typeof jsonFilePath !== "string") {
            return jsonFile;
        }

        if (jsonFilePath.trim() === "") {
            return jsonFile;
        }

        if (!path.isAbsolute(jsonFilePath)) {
            return jsonFile;
        }

        if (!fs.existsSync(jsonFilePath)) {
            return jsonFile;
        }

        if (!fs.statSync(jsonFilePath).isFile()) {
            return jsonFile;
        }

        if (path.extname(jsonFilePath) !== ".json") {
            return jsonFile;
        }

        jsonFile = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

        return jsonFile;

    } catch (error) {

        console.error(error);

        return jsonFile;

    }

}

function setJSONFile(jsonFilePath, jsonFile) {
    
    try {

        if (typeof jsonFilePath !== "string") {
            return false;
        }

        if (!lodash.isPlainObject(jsonFile)) {
            return false;
        }

        if (jsonFilePath.trim() === "") {
            return false;
        }

        if (!path.isAbsolute(jsonFilePath)) {
            return false;
        }

        let jsonFolderPath = path.dirname(jsonFilePath),
            jsonFileName = path.basename(jsonFilePath);

        if (!fs.existsSync(jsonFolderPath)) {
            fs.mkdirSync(jsonFolderPath, { recursive: true });
        }

        if (path.extname(jsonFileName) !== ".json") {
            jsonFileName = path.parse(jsonFileName).name + ".json";
        }

        jsonFilePath = path.join(jsonFolderPath, jsonFileName);

        jsonFile = JSON.stringify(jsonFile, null, 2);

        fs.writeFileSync(jsonFilePath, jsonFile);

        return true;

    } catch (error) {
        
        console.error(error);

        return false;

    }

}

module.exports = {
    isJSONFilePath,
    getJSONFile,
    setJSONFile,
};
