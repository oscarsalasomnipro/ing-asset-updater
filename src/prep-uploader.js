const path = require('path')
const json = require('./utils/json/json.js')
const csv = require('./utils/csv/csv.js')
const folder = require('./utils/folder/folder.js')
const dataForge = require('data-forge')
const localAssets = require('./handlers/assets/assets.js')
const aemAssets = require('./utils/aem/assets/assets.js')
const underscore = require('underscore')

async function main() {

    try {

        const configFilePath = path.resolve(__dirname, '..', 'config', 'config.json')

        if (!json.isJSONFilePath(configFilePath)) {
            console.error("La ruta del archivo de configuración, almacenada en la constante configFilePath, no es valida. Por favor verifique la ruta e intente nuevamente")
            return 1
        }

        let configFile = json.getJSONFile(configFilePath)

        if (!csv.isCSVFilePath(configFile?.local?.assetsFile?.path)) {

            let newAssetsFile = new dataForge.DataFrame({
                "columns": {
                    "_assetFilePathInLocal": []
                }
            })

            newAssetsFile = newAssetsFile.bake()

            const newAssetsFilePath = path.resolve(__dirname, 'csv', 'assetsFile.csv')

            if (csv.setCSVFile(newAssetsFilePath, newAssetsFile)) {

                console.error("La ruta del archivo de assets, almacenada en la ruta local.assetsFile.path en el archivo de configuración, no es valida. Se creará una ruta en la carpeta raíz")

                configFile.local = configFile.local || {}

                configFile.local.assetsFile = configFile.local.assetsFile || {}

                configFile.local.assetsFile.path = newAssetsFilePath

                json.setJSONFile(configFilePath, configFile)

            }

        }

        if (configFile?.local?.assetsFolderScanning?.enabled) {
            if (!folder.isFolderPath(configFile?.local?.assetsFolderScanning?.path)) {
                console.error("La ruta de la carpeta de assets, almacenada en la ruta local.assetsFolderScanning.path en el archivo de configuración, no es valida. Por favor verifique la ruta e intente nuevamente")
                return 1
            }
        }

        let assetsToUpload = localAssets.getAssetsToUpload(configFile?.local?.assetsFile?.path, {
            enableAssetsFolderScanning: configFile?.local?.assetsFolderScanning?.enabled,
            assetsScanningFolderPath: configFile?.local?.assetsFolderScanning?.path
        })

        if (assetsToUpload.length === 0) {
            console.error("No se detectaron assets para cargar. Por favor verifique el contenido del archivo e intente nuevamente")
            return 1
        }

        console.log("El archivo de assets se ha actualizado. Por favor verifique el contenido del archivo")

    } catch (error) {

        console.error(error)

    }

}

main()