"use strict";
/**
 * Load settings written in the sheet.
 * sheet: A:Keys, B:Values, after C:Others
 *
 */
class SheetSettings {
    constructor(sheetName) {
        this.data = {};
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) {
            throw new Error(`シートが見つかりませんでした。` + sheetName);
        }
        this.sheet = sheet;
        for (let [k, v, _] of sheet.getDataRange().getValues()) {
            this.data[String(k)] = v;
        }
    }
    get(key) {
        return this.data[key];
    }
}
