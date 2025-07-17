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
    const folderFragments = aemFolder.split('/').filter(Boolean);
    let currentPath = '';

    for (let i = 0; i < folderFragments.length; i++) {
        const folderName = folderFragments[i];
        currentPath += (i === 0 ? '' : '/') + folderName;

        const fullUrl = encodeURI(`${aemEnviromentURL}/api/assets/${currentPath}`);

        // Verifica si ya existe
        try {
            const getResponse = await axios.get(fullUrl, {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${aemUsername}:${aemPassword}`).toString('base64')
                },
                validateStatus: () => true
            });

            if (getResponse.status === 200) {
                console.log('Carpeta ya existe: ${currentPath}');
                continue; // Ya existe, no crearla de nuevo
            }
        } catch (err) {
            console.error('Error al verificar existencia de ${currentPath}:', err.message);
            return { status: 500, data: err.message };
        }

        // Crear solo si no existe
        try {
            const postResponse = await axios.post(fullUrl, {
                class: 'assetFolder',
                properties: {
                    'jcr:title': folderName // Solo manda title al crear nueva
                }
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(`${aemUsername}:${aemPassword}`).toString('base64')
                },
                validateStatus: () => true
            });

            if (postResponse.status === 201) {
                console.log('Carpeta creada: ${currentPath}');
            } else if (postResponse.status === 409) {
                console.log('Carpeta ya existente detectada: ${currentPath}');
            } else {
                console.warn('Error al crear ${currentPath}: ${postResponse.status}');
                return postResponse;
            }
        } catch (err) {
            console.error('Error al crear carpeta ${currentPath}:', err.message);
            return { status: 500, data: err.message };
        }
    }

    return { status: 201 };
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
