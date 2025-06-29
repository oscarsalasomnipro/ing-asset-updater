const axios = require('axios')
const DirectBinary = require("@adobe/aem-upload")

function normalizeAssetName(assetName) {

    try {

        if (typeof assetName !== 'string') {
            return '_NotAssetName';
        }

        assetName = assetName.trim();

        assetName = assetName.replace(/^\/+|\/+$/g, '');

        assetName = assetName.replace(/[\/\\\*\?"|\:<>\[\]% ]/g, '');

        assetName = assetName.replace(/\/{2,}/g, '/');

        assetName = assetName.replace(/\.+$/, '');

        if (assetName === '') {
            return '_NotAssetName';
        }

        return assetName

    } catch (error) {

        console.error(error)

        return '_NotAssetName'
    }

}

async function getAsset(aemUsername, aemPassword, aemEnviromentURL, aemAsset) {

    let results

    try {

        let config = {
            'method': 'get',
            'maxBodyLength': Infinity,
            'url': encodeURI(aemEnviromentURL + '/api/assets/' + aemAsset),
            'headers': {
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(aemUsername + ':' + aemPassword, 'utf-8').toString('base64')
            },
            'validateStatus': () => true
        }

        results = await axios.request(config)

        return results

    } catch (error) {

        if (error.response.status) {

            return error.response

        } else {

            throw error

        }

    }

}

async function postAssets(aemUsername, aemPassword, aemEnviromentURL, aemFolder, localAssetsToUpload) {

    let results

    try {

        const uploader = new DirectBinary.DirectBinaryUpload();
        const headers = {
            'Authorization': 'Basic ' + Buffer.from(aemUsername + ':' + aemPassword, 'utf-8').toString('base64')
        }
        const options = new DirectBinary.DirectBinaryUploadOptions()
            .withUrl(encodeURI(aemEnviromentURL + '/content/dam/' + aemFolder))
            .withUploadFiles(localAssetsToUpload)
            .withHttpOptions({ headers: headers })

        results = await uploader.uploadFiles(options)

        return results

    } catch (error) {

        console.error(error)

        return results

    }

}

function normalizeAssetFolderName(assetFolderName) {

    try {

        if (typeof assetFolderName !== 'string') {
            return '';
        }

        assetFolderName = assetFolderName.trim();

        assetFolderName = assetFolderName.replace(/^\/+|\/+$/g, '');

        assetFolderName = assetFolderName.replace(/[\\\*\?"|\:<>\[\]% ]/g, '');

        assetFolderName = assetFolderName.replace(/\/{2,}/g, '/');

        assetFolderName = assetFolderName.replace(/\.+$/, '');

        return assetFolderName

    } catch (error) {

        console.error(error)

        return ''
    }

}

async function getAssetFolder(aemUsername, aemPassword, aemEnviromentURL, aemFolder) {

    let results

    try {

        let config = {
            'method': 'get',
            'maxBodyLength': Infinity,
            'url': encodeURI(aemEnviromentURL + '/api/assets/' + aemFolder),
            'headers': {
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(aemUsername + ':' + aemPassword, 'utf-8').toString('base64')
            },
            'validateStatus': () => true
        }

        results = await axios.request(config)

        return results

    } catch (error) {

        if (error.response.status) {

            return error.response

        } else {

            throw error

        }

    }

}


async function postAssetFolder(aemUsername, aemPassword, aemEnviromentURL, aemFolder) {
    
    try {

        let results

        aemFolder = aemFolder.trim();

        const aemFolderFragments = aemFolder.split('/');

        for (let i = 0; i < aemFolderFragments.length; i++) {

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: encodeURI(aemEnviromentURL + "/api/assets/" + currentFolderPath),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(aemUsername + ":" + aemPassword, 'utf-8').toString('base64')
                },
                data: JSON.stringify({
                    'class': 'assetFolder',
                    'properties': {
                        'jcr:title': currentFolderName
                    }
                }),
                validateStatus: () => true
            };

            results = await axios.request(config)

        }

        return results;

    } catch (error) {

        if (error.response.status) {

            return error.response;

        } else {

            throw error;

        }

    }

}

module.exports = {
    normalizeAssetName,
    getAsset,
    postAssets,
    normalizeAssetFolderName,
    getAssetFolder,
    postAssetFolder,
    postAssets
}
