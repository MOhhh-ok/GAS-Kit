/**
 * Load settings written in the sheet.
 * sheet: A:Keys, B:Values, after C:Others
 * 
 */
class SheetSettings {
    sheet: GoogleAppsScript.Spreadsheet.Sheet;
    data: { [key: string]: any } = {};

    constructor(sheetName: string) {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) {
            throw new Error(`シートが見つかりませんでした。` + sheetName);
        }
        this.sheet = sheet;

        for (let [k, v, _] of sheet.getDataRange().getValues()) {
            this.data[String(k)] = v;
        }
    }

    get(key: string): any {
        return this.data[key];
    }
}