"use strict";
class _DriveUtilities {
    // ファイルを変換する
    convert(fileId, format) {
        const fetchOpt = {
            "headers": { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
            "muteHttpExceptions": true
        };
        const fetchUrl = 'https://docs.google.com/document/d/' + fileId + '/export?format=' + format;
        return UrlFetchApp.fetch(fetchUrl, fetchOpt).getBlob();
    }
    // ファイルを変換して保存する
    export(fileId, format, dstFolder) {
        const fileName = DriveApp.getFileById(fileId).getName();
        const newName = this.replaceExtention(fileName, format);
        const blob = this.convert(fileId, format);
        dstFolder.createFile(blob).setName(newName);
    }
    // 拡張子を変更する
    replaceExtention(fileName, newExtension) {
        const regex = /\.[^/.]+$/;
        const ext = fileName.match(regex);
        if (!ext) {
            return fileName + '.' + newExtension;
        }
        return fileName.replace(regex, '.' + newExtension);
    }
}
const DriveUtilities = new _DriveUtilities();
