type DriveUtilitiesFormat = 'docx' | 'pdf' | 'txt' | 'rtf' | 'html' | 'odt' | 'png' | 'jpg' | 'epub';

class _DriveUtilities {

    // ファイルを変換する
    convert(file: GoogleAppsScript.Drive.File, format: DriveUtilitiesFormat): GoogleAppsScript.Base.Blob {
        const fetchOpt = {
            "headers": { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
            "muteHttpExceptions": true
        };
        const fetchUrl = 'https://docs.google.com/document/d/' + file.getId() + '/export?format=' + format;
        return UrlFetchApp.fetch(fetchUrl, fetchOpt).getBlob();
    }

    // ファイルを変換して保存する
    export(file: GoogleAppsScript.Drive.File, format: DriveUtilitiesFormat, dstFolder: GoogleAppsScript.Drive.Folder): void {
        const fileName = file.getName();
        const newName = this.replaceExtentionString(fileName, format);
        const blob = this.convert(file, format);
        dstFolder.createFile(blob).setName(newName);
    }

    // ファイルを移動する
    move(file: GoogleAppsScript.Drive.File, dstFolder: GoogleAppsScript.Drive.Folder): GoogleAppsScript.Drive.File {
        const newFile=file.makeCopy(dstFolder);
        file.getParents().next().removeFile(file);
        return newFile;
    }

    // フォルダを作成する
    createFolder(folderName: string, parentFolder: GoogleAppsScript.Drive.Folder): GoogleAppsScript.Drive.Folder {
        const folders = parentFolder.getFoldersByName(folderName);
        if (folders.hasNext()) {
            return folders.next();
        }
        return parentFolder.createFolder(folderName);
    }

    // 拡張子を変更する
    replaceExtentionString(fileName: string, newExtension: string): string {
        const regex = /\.[^/.]+$/;
        const ext = fileName.match(regex);
        if (!ext) {
            return fileName + '.' + newExtension;
        }
        return fileName.replace(regex, '.' + newExtension);
    }
}

const DriveUtilities = new _DriveUtilities();