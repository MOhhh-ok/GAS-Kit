"use strict";
class Debugger {
    static getTestSpreadSheet() {
        const prop = PropertiesService.getScriptProperties();
        const ss = SpreadsheetApp.openById(prop.getProperty('TEST_SHEET_ID') || '');
        if (!ss) {
            throw new Error('スプレッドシートが見つかりませんでした。');
        }
        return ss;
    }
    static getTestSheet(sheetName) {
        const ss = this.getTestSpreadSheet();
        const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
        return sheet;
    }
}
