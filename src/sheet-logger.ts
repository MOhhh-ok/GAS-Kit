class SheetLogger {
    sheet: GoogleAppsScript.Spreadsheet.Sheet;

    constructor(sheetName: string, maxNum: number = 100) {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('logs');
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

    log(text: string) {
        const date = new Date();
        const row = [
            date,
            text,
        ];
        this.sheet.appendRow(row);
    }
}