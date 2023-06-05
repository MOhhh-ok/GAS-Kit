type DriveUtilitiesFormat = 'docx' | 'pdf' | 'txt' | 'rtf' | 'html' | 'odt' | 'png' | 'jpg' | 'epub';

class _DriveUtilities {

    // ファイルを変換する
    convert(fileId: string, format: DriveUtilitiesFormat): GoogleAppsScript.Base.Blob {
        const fetchOpt = {
            "headers": { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
            "muteHttpExceptions": true
        };
        const fetchUrl = 'https://docs.google.com/document/d/' + fileId + '/export?format=' + format;
        return UrlFetchApp.fetch(fetchUrl, fetchOpt).getBlob();
    }

    // ファイルを変換して保存する
    export(fileId: string, format: DriveUtilitiesFormat, dstFolder: GoogleAppsScript.Drive.Folder): void {
        const fileName = DriveApp.getFileById(fileId).getName();
        const newName = this.replaceExtention(fileName, format);
        const blob = this.convert(fileId, format);
        dstFolder.createFile(blob).setName(newName);
    }

    // ファイルを移動する
    move(fileId: string, dstFolder: GoogleAppsScript.Drive.Folder): void {
        const file = DriveApp.getFileById(fileId);
        dstFolder.addFile(file);
        file.getParents().next().removeFile(file);
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
    replaceExtention(fileName: string, newExtension: string): string {
        const regex = /\.[^/.]+$/;
        const ext = fileName.match(regex);
        if (!ext) {
            return fileName + '.' + newExtension;
        }
        return fileName.replace(regex, '.' + newExtension);
    }
}

const DriveUtilities = new _DriveUtilities();