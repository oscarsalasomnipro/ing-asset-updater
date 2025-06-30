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

        let assetsToUploadFolders = localAssets.getAssetsToUploadFolders(configFile?.local?.assetsFile?.path)

        let assetsToUploadAvailableFolders = []

        for (let i = 0; i < assetsToUploadFolders.length; i++) {

            let assetFolderCreationResponse = await aemAssets.postAssetFolder(configFile?.aem?.username,
                configFile?.aem?.password,
                configFile?.aem?.enviromentURL,
                assetsToUploadFolders[i]
            )

            if (assetFolderCreationResponse.status === 201) {

                console.log("La ruta", assetsToUploadFolders[i], "se ha creado exitosamente en AEM")

                assetsToUploadAvailableFolders.push(assetsToUploadFolders[i])

            } else if (assetFolderCreationResponse.status === 409) {

                console.log("La ruta", assetsToUploadFolders[i], "ya existe en AEM")

                assetsToUploadAvailableFolders.push(assetsToUploadFolders[i])

            } else {

                console.log("La ruta", assetsToUploadFolders[i], "no se pudo crear en AEM")

            }

        }

        assetsToUpload = assetsToUpload.filter(assetToUpload => underscore.includes(assetsToUploadAvailableFolders, assetToUpload._assetFolderPathInAEM))

        if (assetsToUpload.length === 0) {
            console.error("No se detectaron assets para cargar. Por favor verifique el contenido del archivo e intente nuevamente")
            return 1
        }

        for (let i = 0; i < assetsToUploadAvailableFolders.length; i++) {

            let assetsBatchToUpload = assetsToUpload.filter(assetToUpload => assetToUpload._assetFolderPathInAEM === assetsToUploadAvailableFolders[i])

            assetsBatchToUpload = assetsBatchToUpload.map(assetToUpload => {
                return {
                    'fileName': assetToUpload._assetFileNameInAEM,
                    'fileSize': assetToUpload._assetFileSizeInLocal,
                    'filePath': assetToUpload._assetFilePathInLocal,
                    'replace': true
                }
            })

            let assetsUploadResults = await aemAssets.postAssets(configFile?.aem?.username,
                configFile?.aem?.password,
                configFile?.aem?.enviromentURL,
                assetsToUploadAvailableFolders[i],
                assetsBatchToUpload
            )

            if (assetsUploadResults?.detailedResult?.length > 0) {

                let patchedUploadedAssets = localAssets.patchUploadedAssets(configFile?.local?.assetsFile?.path,
                    assetsUploadResults?.detailedResult
                )

                if(patchedUploadedAssets){

                    console.log("El archivo de assets se ha actualizado. Por favor verifique el contenido del archivo")

                }else{

                    console.log("El archivo de assets no se pudo actualizar")

                }

            }else{

                console.log("No se detectaron assets cargados")

            }

        }

    } catch (error) {

        console.error(error)

    }

}

main()