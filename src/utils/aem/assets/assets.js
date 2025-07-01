const axios = require('axios')
const DirectBinary = require("@adobe/aem-upload")

function normalizeAssetName(assetName) {

    try {

        if (typeof assetName !== 'string') {
            return '_NotAssetName';
        }

        assetName = assetName.replace(/^\/+|\/+$/g, '');

        assetName = assetName.replace(/[\/\\\*\?"|\:<>\[\]%]/g, '');

        assetName = assetName.replace(/\/{2,}/g, '/');

        assetName = assetName.replace(/\.+$/, '');

        assetName = assetName.trim();

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

async function putAsset(aemUsername, aemPassword, aemEnviromentURL, aemAsset, aemAssetDataToUpdate) {

    let results

    try {

        let data = JSON.stringify({
            'class': 'asset',
            'properties': aemAssetDataToUpdate
        })

        let config = {
            'method': 'put',
            'maxBodyLength': Infinity,
            'url': encodeURI(aemEnviromentURL + '/api/assets/' + aemAsset),
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(aemUsername + ':' + aemPassword, 'utf-8').toString('base64')
            },
            'data': data,
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

function normalizeAssetFolderName(assetFolderName) {

    try {

        if (typeof assetFolderName !== 'string') {
            return '';
        }

        assetFolderName = assetFolderName.replace(/^\/+|\/+$/g, '');

        assetFolderName = assetFolderName.replace(/[\\\*\?"|\:<>\[\]%]/g, '');

        assetFolderName = assetFolderName.replace(/\/{2,}/g, '/');

        assetFolderName = assetFolderName.replace(/\.+$/, '');

        assetFolderName = assetFolderName.trim();

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

        const aemFolderFragments = aemFolder.split('/');

        for (let i = 0; i < aemFolderFragments.length; i++) {

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: encodeURI(aemEnviromentURL + "/api/assets/" + aemFolderFragments.slice(0, i + 1).join('/')),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(aemUsername + ":" + aemPassword, 'utf-8').toString('base64')
                },
                data: JSON.stringify({
                    'class': 'assetFolder',
                    'properties': {
                        'jcr:title': aemFolderFragments[aemFolderFragments.length - 1]
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
    putAsset,
    normalizeAssetFolderName,
    getAssetFolder,
    postAssetFolder
}
