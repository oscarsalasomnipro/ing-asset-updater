const path = require('path')
const fs = require('fs')
const csv = require('../../utils/csv/csv.js')
const dataForge = require('data-forge')
require('data-forge-fs')
const folder = require('../../utils/folder/folder.js')
const file = require('../../utils/file/file.js')
const aemAssets = require('../../utils/aem/assets/assets.js')
const underscore = require('underscore')

function getAssetsToUpload(assetsFilePath, { enableAssetsFolderScanning = false, assetsScanningFolderPath = '' }) {

    let assetsToUpload = []

    try {

        if (!csv.isCSVFilePath(assetsFilePath)) {

            console.error("La ruta del archivo de assets, almacenada en la ruta local.assetsFile.path en el archivo de configuración, no es valida. Por favor verifique la ruta e intente nuevamente")

            return assetsToUpload

        }

        let assetsFile = dataForge.readFileSync(assetsFilePath).parseCSV()

        assetsFile = assetsFile.bake()

        if (!assetsFile.hasSeries('_assetFilePathInLocal')) {

            console.error("La columna _assetFilePathInLocal no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return assetsToUpload

        }

        if (enableAssetsFolderScanning === true) {

            if (folder.isFolderPath(assetsScanningFolderPath)) {

                let filesOnAssetsScanningFolder = file.getAllFilesPaths(assetsScanningFolderPath)

                if (filesOnAssetsScanningFolder.length > 0) {

                    filesOnAssetsScanningFolder = filesOnAssetsScanningFolder.map(fileOnAssetsScanningFolder => {
                        return {
                            _assetFilePathInLocal: fileOnAssetsScanningFolder
                        }
                    })

                    assetsFile = assetsFile.concat(new dataForge.DataFrame(filesOnAssetsScanningFolder))

                }

            } else {

                console.error("La ruta de la carpeta de assets, almacenada en la ruta local.assetsFolderScanning.path en el archivo de configuración, no es valida. El contenido de la ruta de la carpeta de assets no se tendrá en cuenta")

            }

        }

        assetsFile = assetsFile.select(row => {
            return {
                ...row,
                _assetFilePathInLocal: row._assetFilePathInLocal.trim()
            }
        })

        assetsFile = assetsFile.bake()

        assetsFile = assetsFile.distinct(row => row._assetFilePathInLocal)

        assetsFile = assetsFile.bake()

        assetsFile = assetsFile.where(row => file.isFilePath(row._assetFilePathInLocal))

        assetsFile = assetsFile.bake()

        assetsFile = assetsFile.select(row => {
            return {
                ...row,
                _assetFileSizeInLocal: fs.statSync(row._assetFilePathInLocal).size,
                _assetFolderPathInAEM: typeof row._assetFolderPathInAEM === 'string' ? aemAssets.normalizeAssetFolderName(row._assetFolderPathInAEM) : '',
                _assetFileNameInAEM: typeof row._assetFileNameInAEM === 'string' ? aemAssets.normalizeAssetName(row._assetFileNameInAEM) : path.basename(row._assetFilePathInLocal),
                _isAssetUploaded: typeof row._isAssetUploaded === 'string' ? row._isAssetUploaded : 'false',
                _assetUploadedAt: typeof row._assetUploadedAt === 'string' ? row._assetUploadedAt : ''
            }
        })

        assetsFile = assetsFile.bake()

        assetsFile = assetsFile.select(row => {
            return {
                ...row,
                _assetFileNameInAEM: row._assetFileNameInAEM === '_NotAssetName' ? path.basename(row._assetFilePathInLocal) : row._assetFileNameInAEM
            }
        })

        assetsFile = assetsFile.bake()

        assetsFile = assetsFile.select(row => {
            return {
                ...row,
                _assetFileNameInAEM: path.extname(row._assetFilePathInLocal) === path.extname(row._assetFileNameInAEM) ? row._assetFileNameInAEM : path.parse(row._assetFileNameInAEM).name + path.extname(row._assetFilePathInLocal)
            }
        })

        assetsFile = assetsFile.bake()

        assetsFile = assetsFile.subset(assetsFile.getColumnNames().sort())

        if (assetsFile.count() > 0) {

            assetsFile.asCSV({ delimiter: ';' }).writeFileSync(assetsFilePath);

        }

        assetsToUpload = assetsFile.toArray()

        assetsToUpload = assetsToUpload.filter(assetToUpload => assetToUpload._isAssetUploaded === 'false')

        return assetsToUpload

    } catch (error) {

        console.error(error)

        return assetsToUpload

    }
}

function getAssetsToUploadFolders(assetsFilePath) {

    let assetsToUploadFolders = []

    try {

        if (!csv.isCSVFilePath(assetsFilePath)) {

            console.error("La ruta del archivo de assets, almacenada en la ruta local.assetsFile.path en el archivo de configuración, no es valida. Por favor verifique la ruta e intente nuevamente")

            return assetsToUploadFolders

        }

        let assetsFile = dataForge.readFileSync(assetsFilePath).parseCSV()

        assetsFile = assetsFile.bake()

        if (!assetsFile.hasSeries('_assetFolderPathInAEM')) {

            console.error("La columna _assetFolderPathInAEM no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return assetsToUploadFolders

        } else if (!assetsFile.hasSeries('_isAssetUploaded')) {

            console.error("La columna _isAssetUploaded no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return assetsToUploadFolders

        }

        assetsFile = assetsFile.where(row => row._isAssetUploaded === 'false')

        assetsFile = assetsFile.bake()

        assetsToUploadFolders = underscore.uniq(assetsFile.getSeries('_assetFolderPathInAEM').toArray())

        return assetsToUploadFolders

    } catch (error) {

        console.error(error)

        return assetsToUploadFolders

    }

}

function patchUploadedAssets(assetsFilePath, uploadedAssets) {

    let patchedUploadedAssets = false

    try {

        if (!csv.isCSVFilePath(assetsFilePath)) {

            console.error("La ruta del archivo de assets, almacenada en la ruta local.assetsFile.path en el archivo de configuración, no es valida. Por favor verifique la ruta e intente nuevamente")

            return patchedUploadedAssets

        }

        if (!Array.isArray(uploadedAssets)) {

            console.error("La información de los assets cargados no está en formato Array. Por favor verifique los resultados de la carga e intente nuevamente")

            return patchedUploadedAssets

        }

        let assetsFile = dataForge.readFileSync(assetsFilePath).parseCSV()

        assetsFile = assetsFile.bake()

        if (!assetsFile.hasSeries('_assetFileNameInAEM')) {

            console.error("La columna _assetFileNameInAEM no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return patchedUploadedAssets;

        } else if (!assetsFile.hasSeries('_assetFilePathInLocal')) {

            console.error("La columna _assetFilePathInLocal no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return patchedUploadedAssets;

        } else if (!assetsFile.hasSeries('_assetFileSizeInLocal')) {

            console.error("La columna _assetFileSizeInLocal no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return patchedUploadedAssets;

        } else if (!assetsFile.hasSeries('_assetFolderPathInAEM')) {

            console.error("La columna _assetFolderPathInAEM no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return patchedUploadedAssets;

        } else if (!assetsFile.hasSeries('_assetUploadedAt')) {

            console.error("La columna _assetUploadedAt no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return patchedUploadedAssets;

        } else if (!assetsFile.hasSeries('_isAssetUploaded')) {

            console.error("La columna _isAssetUploaded no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return patchedUploadedAssets;

        }

        assetsFile = assetsFile.select(row => {
            return {
                ...row,
                _assetFilePathInLocal: row._assetFilePathInLocal.trim()
            }
        })

        assetsFile = assetsFile.bake()

        assetsFile = assetsFile.distinct(row => row._assetFilePathInLocal)

        assetsFile = assetsFile.bake()

        assetsFile = assetsFile.where(row => file.isFilePath(row._assetFilePathInLocal))

        assetsFile = assetsFile.bake()

        uploadedAssets.forEach(uploadedAsset => {

            assetsFile = assetsFile.select(row => {
                if (uploadedAsset.filePath === row._assetFilePathInLocal) {
                    return {
                        ...row,
                        _isAssetUploaded: 'true',
                        _assetUploadedAt: new Date().toISOString(),
                        _assetFilePathInAEM: uploadedAsset?.result?.targetFile.replace('/content/dam/', '')
                    }
                } else {
                    return {
                        ...row
                    }
                }
            })

            assetsFile = assetsFile.bake()

        })

        assetsFile = assetsFile.subset(assetsFile.getColumnNames().sort())

        assetsFile = assetsFile.bake()

        assetsFile.asCSV({ delimiter: ';' }).writeFileSync(assetsFilePath)

        patchedUploadedAssets = true

        return patchedUploadedAssets

    } catch (error) {

        console.error(error)

        return patchedUploadedAssets;

    }

}

function getAssetsToUpdate(assetsFilePath, metadataMapping) {

    let assetsToUpdate = []

    try {

        if (!csv.isCSVFilePath(assetsFilePath)) {

            console.error("La ruta del archivo de assets, almacenada en la ruta local.assetsFile.path en el archivo de configuración, no es valida. Por favor verifique la ruta e intente nuevamente")

            return assetsToUpdate

        }

        let assetsFile = dataForge.readFileSync(assetsFilePath).parseCSV()

        assetsFile = assetsFile.bake()

        if (!assetsFile.hasSeries('_assetFilePathInAEM')) {

            console.error("La columna _assetFilePathInAEM no se encuentra en el archivo de assets. Por favor verifique el contenido del archivo e intente nuevamente")

            return assetsToUpdate

        }

        if (!Array.isArray(metadataMapping)) {
            console.error("El mapeo de campos de los assets, almacenado en la ruta local.assetsFile.metadataMapping en el archivo de configuración, no es valido. Por favor verifique el mapeo e intente nuevamente")
            return assetsToUpdate
        }

        if (metadataMapping.every(metadataMappingField =>
            typeof metadataMappingField.columnInAssetsFile === 'string' &&
            typeof metadataMappingField.metadataFieldInAEM === 'string' &&
            typeof metadataMappingField.isMetadata === 'boolean' &&
            typeof metadataMappingField.isStringArray === 'boolean'
        )) {
            if (metadataMapping.some(metadataMappingField =>
                metadataMappingField.columnInAssetsFile.trim() === '' ||
                metadataMappingField.metadataFieldInAEM.trim() === ''
            )) {
                console.error("El mapeo de campos de los assets, almacenados en las rutas local.assetsFile.metadataMapping[*].columnInAssetsFile y local.assetsFile.metadataMapping[*].metadataFieldInAEM en el archivo de configuración, están vacíos. Por favor verifique el mapeo e intente nuevamente")
                return assetsToUpdate
            }

        } else {
            console.error("El mapeo de campos de los assets, almacenado en la ruta local.assetsFile.metadataMapping[*] en el archivo de configuración, no es valido. Por favor verifique el mapeo e intente nuevamente")
            return assetsToUpdate
        }

        assetsFile = assetsFile.select(row => {
            return {
                ...row,
                _isAssetUpdated: typeof row._isAssetUpdated === 'string' ? row._isAssetUpdated : 'false',
                _assetUpdatedAt: typeof row._assetUpdatedAt === 'string' ? row._assetUpdatedAt : ''
            }
        })

        assetsFile = assetsFile.bake()

        assetsFile = assetsFile.subset(assetsFile.getColumnNames().sort())

        if (assetsFile.count() > 0) {

            assetsFile.asCSV({ delimiter: ';' }).writeFileSync(assetsFilePath);

        }

        for (let i = 0; i < assetsFile.count(); i++) {

            if (assetsFile.at(i)._isAssetUpdated !== 'false') {
                continue
            }

            let assetMetadataToUpdate = {
                _assetFilePathInAEM: assetsFile.at(i)._assetFilePathInAEM
            }

            for (let j = 0; j < metadataMapping.length; j++) {

                if (!assetsFile.hasSeries(metadataMapping[j].columnInAssetsFile)) {
                    continue
                }

                if (typeof assetsFile.at(i)[metadataMapping[j].columnInAssetsFile] !== 'string') {
                    continue
                }

                if (assetsFile.at(i)[metadataMapping[j].columnInAssetsFile].trim() === '') {
                    continue
                }

                if (metadataMapping[j].isMetadata) {
                    assetMetadataToUpdate.data = assetMetadataToUpdate.data || {}
                    assetMetadataToUpdate.data.metadata = assetMetadataToUpdate.data.metadata || {}
                    assetMetadataToUpdate.data.metadata[metadataMapping[j].metadataFieldInAEM] = metadataMapping[j].isStringArray ? assetsFile.at(i)[metadataMapping[j].columnInAssetsFile].split(',') : assetsFile.at(i)[metadataMapping[j].columnInAssetsFile]
                } else {
                    assetMetadataToUpdate.data = assetMetadataToUpdate.data || {}
                    assetMetadataToUpdate.data[metadataMapping[j].metadataFieldInAEM] = metadataMapping[j].isStringArray ? assetsFile.at(i)[metadataMapping[j].columnInAssetsFile].split(',') : assetsFile.at(i)[metadataMapping[j].columnInAssetsFile]
                }

            }

            if (assetMetadataToUpdate.data) {
                assetsToUpdate.push(assetMetadataToUpdate)
            }

        }

        return assetsToUpdate

    } catch (error) {

        console.error(error)

        return assetsToUpdate

    }

}

module.exports = {
    getAssetsToUpload,
    getAssetsToUploadFolders,
    patchUploadedAssets,
    getAssetsToUpdate
}