# ASSET-PREPARATOR-UPLOADER-UPDATER
El siguiente código tiene como objetivo automatizar la detección y preparación de activos o assets ubicados **localmente** para su posterior carga a la instancia de Adobe Experience Manager As Cloud Service. A esto, se suma como objetivo automatizar la detección de assets ubicados en la **instancia de Adobe Experience Manager As Cloud Service** para su posterior actualización de metadatos.

## Configuraciones
La configuración del código se almacena en la ruta `ing-aec-aem-asset-uploader-updater/config/config.json`. Los valores configurables se describen a continuación:

| Campo | Descripción |
|--|--|
| **aem.enviromentURL** | Valor de cadena de caracteres que corresponde al URL de la instancia de Adobe Experience Manager As Cloud Service. Por ejemplo, `https://author-p146602-e1506206.adobeaemcloud.com`. |
| **aem.username** | Valor de cadena de caracteres que corresponde al nombre de usuario de la instancia de Adobe Experience Manager As Cloud Service. Por ejemplo, `aem_assets_integration_dev`. Este usuario requiere de los permisos necesarios para realizar acciones via Assets API y mediante las librerías descritas en la documentación oficial de Adobe. |
| **aem.password** | Valor de cadena de caracteres que corresponde a la contraseña asociada al nombre de usuario de la instancia de Adobe Experience Manager anteriormente descrito. Por ejemplo, `tempo123`. |
| **local.assetsFile.path** | Valor de cadena de caracteres que corresponde a la ruta absoluta local del archivo CSV que contiene la información de todos los activos o assets. Por ejemplo, `C:\\Users\\Admin\\Documents\\ing-aec-aem-asset-uploader-updater\\csv\\assets.csv`. |
| **local.assetsFile.metadataMapping** | Valor de arreglo de objetos que corresponden a la relación entre las columnas en el archivo local ubicado en la ruta descrita en **local.assetsFile.path** y los metadatos en Adobe Experience Manager As Cloud Service. Por ejemplo, `[{"columnInAssetsFile": "Title","metadataFieldInAEM": "dc:title","isMetadata": false,"isStringArray": false},{"columnInAssetsFile": "Tags","metadataFieldInAEM": "dc:subject","isMetadata": false,"isStringArray": true},{"columnInAssetsFile": "Description","metadataFieldInAEM": "dc:description","isMetadata": false,"isStringArray": false}]`. |
| **local.assetsFile.metadataMapping[].columnInAssetsFile** | Valor de cadena de caracteres que corresponde al nombre de la columna en el archivo local ubicado en la ruta descrita en **local.assetsFile.path** que contiene el metadato. Por ejemplo, `Title`. |
| **local.assetsFile.metadataMapping[].metadataFieldInAEM** | Valor de cadena de caracteres que corresponde al metadato en Adobe Experience Manager As Cloud Service que se va a actualizar con ayuda de **local.assetsFile.metadataMapping[].columnInAssetsFile**. Por ejemplo, `dc:title`. |
| **local.assetsFile.metadataMapping[].isMetadata** | Valor boleano que corresponde a habilitar o deshabilitar la opción de actualizar el metadato contenido en **local.assetsFile.metadataMapping[].columnInAssetsFile** como valor por defecto, como `dc:title`, o como valor personalizado, como `ing:customerJourney`. Por ejemplo, `true`. |
| **local.assetsFile.metadataMapping[].isStringArray** | Valor boleano que corresponde a habilitar o deshabilitar la opción de realizar splits sobre el metadato contenido en **local.assetsFile.metadataMapping[].columnInAssetsFile**. Por ejemplo, `true`. |
| **local.assetsFolderScanning.enabled** | Valor boleano que corresponde a habilitar o deshabilitar la opción de detectar activos o assets desde la carpeta ubicada en la ruta descrita en **local.assetsFolderScanning.path**. Por ejemplo, `false`. |
| **local.assetsFolderScanning.path** | Valor de cadena de caracteres que corresponde a la ruta absoluta local de la carpeta que contiene activos o assets. Por ejemplo, `C:\\Users\\Admin\\Images\\assets\\prestamo`. |


## Carga de activos o assets
Para la carga de activos o assets, el archivo CSV, anteriormente mencionado, de manera obligatoria debe contener debe contener:
- La columna `_assetFilePathInLocal`, que corresponde a la columna que almacena las rutas absolutas locales de los activos o assets que se van a cargar. Si existe alguna ruta no valida, su línea completa será eliminada del archivo.

Por otra parte, el archivo CSV, de manera opcional, puede contener:
- La columna `_assetFileNameInAEM`, que corresponde a la columna que almacena los nombres que se van a otorgar a los activos o assets una vez se carguen en Adobe Experience Manager As Cloud Service. Si existe algún valor vacío, al momento de cargar el activo o asset, se le asignará un nombre basado en la ruta absoluta local de la columna `_assetFilePathInLocal`. Si existe algún valor con una extensión no correspondiente a la ruta absoluta local de la columna `_assetFilePathInLocal`, se conservará el nombre, pero se asignará la extensión correspondiente a la ruta absoluta local de la columna `_assetFilePathInLocal`.

- La columna `_assetFolderPathInAEM`, que corresponde a la columna que almacena las rutas de las carpetas donde se van a almacenar los activos o assets una vez se carguen en Adobe Experience Manager As Cloud Service. Si existe algún valor vacío, al momento de cargar el activo o asset, se le asignará la ruta de carpeta por defecto en la instancia de Adobe Experience Manager As Cloud Service. Si existe alguna ruta que no existe, antes de realizar la carga se creará automaticamente.

Antes de comenzar con la carga de activos o assets, se recomienda utilizar `prep-uploader.js` para obtener la versión final del archivo y revisar si todo corresponde a lo esperado.

Posteriormente, se utiliza `uploader.js` para comenzar la carga. Una vez finalice la carga, el archivo CSV contendrá:

- La columna `_assetFilePathInAEM`, que corresponde a la columna que almacena las rutas de los activos o assets cargados en Adobe Experience Manager As Cloud Service. Esta columna, para la actualización de metadatos de activos o assets, es obligatoria.

- La columna `_assetFileSizeInLocal`, que corresponde a la columna que almancena el tamaño de los activos o assets.

- La columna `_assetUploadedAt`, que corresponde a la columna que almacena la marca de tiempo (UTC) de la fecha de carga de los activos o assets cargados en Adobe Experience Manager As Cloud Service.

- La columna `_isAssetUploaded`, que corresponde a la columna que almacena el estado de carga de los activos o assets.

## Actualización de metadatos de activos o assets
Para la actualización de metadatos de activos o assets, el archivo CSV, anteriormente mencionado, de manera obligatoria debe contener debe contener:

- La columna `_assetFilePathInAEM`, que corresponde a la columna que almacena las rutas en Adobe Experience Manager As Cloud Service de los activos o assets que se van a actualizar. Si existe alguna ruta no valida, su línea completa será eliminada del archivo.

- Las columnas descritas en **local.assetsFile.metadataMapping[*].columnInAssetsFile** del archivo de configuración.

Antes de comenzar con la actualización de metadatos de activos o assets, se recomienda utilizar `prep-updater.js` para obtener la versión final del archivo y revisar si todo corresponde a lo esperado.

Posteriormente, se utiliza `updater.js` para comenzar la actualización. Una vez finalice la actualización, el archivo CSV contendrá:

- La columna `_assetUpdatedAt`, que corresponde a la columna que almacena la marca de tiempo (UTC) de la fecha de actualización de metadatos de los activos o assets actualizados en Adobe Experience Manager As Cloud Service.

- La columna `_isAssetUpdated`, que corresponde a la columna que almacena el estado de actualización de metadatos de los activos o assets.
