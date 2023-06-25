"use strict";
class SheetLogger {
    constructor(args) {
        if (!args.sheet) {
            throw new Error('sheetがありません。');
        }
        this.sheet = args.sheet;
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
    const aaa = new SheetLogger({
        sheet: SpreadsheetApp.getActive().getSheetByName('logs'),
        maxNum: 10,
    });
    aaa.hookLogger();
    Logger.log(new Date());
}
