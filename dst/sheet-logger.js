"use strict";
class SheetLogger {
    constructor(sheetName = 'logs', maxNum = 100) {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) {
            throw new Error('logsシートが存在しません。');
        }
        this.sheet = sheet;
        // ログの最大数を超えていたら古いログを削除する
        const rows = sheet.getLastRow();
        if (rows > maxNum) {
            sheet.deleteRows(1, rows - maxNum);
        }
    }
    log(text) {
        const date = new Date();
        const row = [
            date,
            text,
        ];
        this.sheet.appendRow(row);
    }
}
