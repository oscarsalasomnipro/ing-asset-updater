const path = require('path')
const fs = require('fs')
require('data-forge-fs');
const dataForge = require('data-forge')

function isCSVFilePath(filePath) {

    try {

        if (typeof filePath !== 'string') {
            return false;
        }

        if (filePath.trim() === '') {
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

        if (path.extname(filePath) !== '.csv') {
            return false;
        }

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

}

function getCSVFile(csvFilePath) {

    let csvFile = {}

    try {

        if (typeof csvFilePath !== 'string') {
            return csvFile;
        }

        if (csvFilePath.trim() === '') {
            return csvFile;
        }

        if (!path.isAbsolute(csvFilePath)) {
            return csvFile;
        }

        if (!fs.existsSync(csvFilePath)) {
            return csvFile;
        }

        if (!fs.statSync(csvFilePath).isFile()) {
            return csvFile;
        }

        if (path.extname(csvFilePath) !== '.csv') {
            return csvFile;
        }

        csvFile = dataForge.readFileSync(csvFilePath).parseCSV()

        csvFile = csvFile.bake()

        return csvFile

    } catch (error) {

        console.error(error)

        return csvFile

    }

}

function setCSVFile(csvFilePath, csvFile) {
    try {

        if (typeof csvFilePath !== "string") {
            return false;
        }

        if (!(csvFile instanceof dataForge.DataFrame)) {
            return false;
        }

        if (csvFilePath.trim() === "") {
            return false;
        }

        if (!path.isAbsolute(csvFilePath)) {
            return false;
        }

        let csvFolderPath = path.dirname(csvFilePath),
            csvFileName = path.basename(csvFilePath);

        if (!fs.existsSync(csvFolderPath)) {
            fs.mkdirSync(csvFolderPath, { recursive: true });
        }

        if (path.extname(csvFileName) !== ".csv") {
            csvFileName = path.parse(csvFileName).name + ".csv";
        }

        csvFilePath = path.join(csvFolderPath, csvFileName);

        csvFile.asCSV().writeFileSync(csvFilePath)

        return true

    } catch (error) {
        console.error(error)

        return false
    }
}

module.exports = {
    isCSVFilePath,
    getCSVFile,
    setCSVFile
}