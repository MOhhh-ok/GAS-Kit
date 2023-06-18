"use strict";
class _DriveUtilities {
    // ファイルを変換する
    convert(file, format) {
        const fetchOpt = {
            "headers": { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
            "muteHttpExceptions": true
        };
        const fetchUrl = 'https://docs.google.com/document/d/' + file.getId() + '/export?format=' + format;
        return UrlFetchApp.fetch(fetchUrl, fetchOpt).getBlob();
    }
    // ファイルを変換して保存する
    export(file, format, dstFolder) {
        const fileName = file.getName();
        const newName = this.replaceExtentionString(fileName, format);
        const blob = this.convert(file, format);
        dstFolder.createFile(blob).setName(newName);
    }
    // ファイルを移動する
    move(file, dstFolder) {
        const newFile = file.makeCopy(dstFolder);
        file.getParents().next().removeFile(file);
        return newFile;
    }
    // フォルダを取得。存在しなければ作成する
    getFolder(folderName, parent, create = false) {
        const folder = parent.getFoldersByName(folderName);
        if (folder.hasNext()) {
            return folder.next();
        }
        if (create) {
            return parent.createFolder(folderName);
        }
        throw new Error('フォルダが見つかりません。' + folderName);
    }
    // ファイルを取得。存在しなければ作成する(オプション)
    getFile(fileName, parent, create = false) {
        const files = parent.getFilesByName(fileName);
        if (files.hasNext()) {
            return files.next();
        }
        if (create) {
            return parent.createFile(fileName, '');
        }
        throw new Error('ファイルが見つかりません。' + fileName);
    }
    // 親フォルダを取得(IDチェックあり)
    getParent(selfFile) {
        // イテレータ
        const parentsIterator = selfFile.getParents();
        // フォルダを配列に格納
        const parents = [];
        while (parentsIterator.hasNext()) {
            parents.push(parentsIterator.next());
        }
        // 候補が１つなら返す
        if (parents.length == 1) {
            return parents[0];
        }
        // 複数なら精査する
        for (let parent of parents) {
            const filesIterator = parent.getFilesByName(selfFile.getName());
            while (filesIterator.hasNext()) {
                const file = filesIterator.next();
                if (file.getId() == selfFile.getId()) {
                    return parent;
                }
            }
        }
        throw new Error('親フォルダを取得できませんでした。' + selfFile.getName());
    }
    // 拡張子を変更する
    replaceExtentionString(fileName, newExtension) {
        const regex = /\.[^/.]+$/;
        const ext = fileName.match(regex);
        if (!ext) {
            return fileName + '.' + newExtension;
        }
        return fileName.replace(regex, '.' + newExtension);
    }
}
const DriveUtilities = new _DriveUtilities();
function driveUtilitiesTest() {
    console.log(DriveUtilities.getScriptFolder().getName());
}
