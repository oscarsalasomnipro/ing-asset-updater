const path = require('path')
const json = require('./utils/json/json.js')
const csv = require('./utils/csv/csv.js')
const localAssets = require('./handlers/assets/assets.js')

async function main() {

    try {

        const configFilePath = path.resolve(__dirname, '..', 'config', 'config.json')

        if (!json.isJSONFilePath(configFilePath)) {
            console.error("La ruta del archivo de configuración, almacenada en la constante configFilePath, no es valida. Por favor verifique la ruta e intente nuevamente")
            return 1
        }

        let configFile = json.getJSONFile(configFilePath)

        if (!Array.isArray(configFile?.local?.assetsFile?.metadataMapping)) {
            console.error("El mapeo de campos de los assets, almacenado en la ruta local.assetsFile.metadataMapping en el archivo de configuración, no es valido. Por favor verifique el mapeo e intente nuevamente")
            return 1
        }

        if (configFile?.local?.assetsFile?.metadataMapping.every(metadataMappingField =>
            typeof metadataMappingField.columnInAssetsFile === 'string' &&
            typeof metadataMappingField.metadataFieldInAEM === 'string' &&
            typeof metadataMappingField.isMetadata === 'boolean' &&
            typeof metadataMappingField.isStringArray === 'boolean'
        )) {
            if (configFile?.local?.assetsFile?.metadataMapping.some(metadataMappingField =>
                metadataMappingField.columnInAssetsFile.trim() === '' ||
                metadataMappingField.metadataFieldInAEM.trim() === ''
            )) {
                console.error("El mapeo de campos de los assets, almacenados en las rutas local.assetsFile.metadataMapping[*].columnInAssetsFile y local.assetsFile.metadataMapping[*].metadataFieldInAEM en el archivo de configuración, están vacíos. Por favor verifique el mapeo e intente nuevamente")
                return 1
            }
        } else {
            console.error("El mapeo de campos de los assets, almacenado en la ruta local.assetsFile.metadataMapping[*] en el archivo de configuración, no es valido. Por favor verifique el mapeo e intente nuevamente")
            return 1
        }

        if (!csv.isCSVFilePath(configFile?.local?.assetsFile?.path)) {
            console.error("La ruta del archivo de assets, almacenada en la ruta local.assetsFile.path en el archivo de configuración, no es valida. Por favor verifique la ruta e intente nuevamente")
            return 1
        }

        let assetsToUpdate = localAssets.getAssetsToUpdate(configFile?.local?.assetsFile?.path,
            configFile?.local?.assetsFile?.metadataMapping)

    } catch (error) {

        console.error(error)

    }

}

main()