"use strict";
class SheetLogger {
    constructor(args) {
        this.singleLineRange = null;
        if (!args.sheet) {
            throw new Error('sheetがありません。');
        }
        this.sheet = args.sheet;
        this.singleLine = args.singleLine || false;
        if (this.singleLine) {
            this.sheet.appendRow([new Date()]);
            this.singleLineRange = this.sheet.getRange(1, 2);
        }
        // ログの最大数を超えていたら古いログを削除する
        const rows = this.sheet.getLastRow();
        const maxNum = args.maxNum || 100;
        if (rows > maxNum) {
            this.sheet.deleteRows(1, rows - maxNum);
        }
    }
    log(text) {
        const date = new Date();
        const row = [
            date,
            text,
        ];
        if (this.singleLineRange) {
            const value = this.singleLineRange.getValue() + ' ' + text;
            this.singleLineRange.setValue(value);
            return;
        }
        this.sheet.appendRow(row);
    }
    // Logger.log時に呼ばれるようにする
    hookLogger() {
        const self = this;
        const originalLog = Logger.log;
        Logger.log = function (text) {
            //originallob bind
            originalLog.bind(Logger)(text);
            self.log(text);
        };
    }
}
function sheetLoggerTest() {
    const id = PropertiesService.getScriptProperties().getProperty('TEST_SHEET_ID');
    if (!id)
        throw new Error('TEST_SHEET_IDがありません。');
    const ss = SpreadsheetApp.openById(id);
    const aaa = new SheetLogger({
        sheet: ss.getSheetByName('logs') || ss.insertSheet('logs'),
        maxNum: 10,
        singleLine: false,
    });
    aaa.hookLogger();
    Logger.log('aiueo');
    Logger.log('kaikukeko');
}
