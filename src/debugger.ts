/** This is just for debugging Gas-Kit */

class Debugger {
    static getTestSpreadSheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
        const prop = PropertiesService.getScriptProperties();
        const ss = SpreadsheetApp.openById(prop.getProperty('TEST_SHEET_ID') || '');
        if (!ss) {
            throw new Error('スプレッドシートが見つかりませんでした。');
        }
        return ss;
    }

    static getTestSheet(sheetName: string): GoogleAppsScript.Spreadsheet.Sheet {
        const ss = this.getTestSpreadSheet();
        const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
        return sheet;
    }
}