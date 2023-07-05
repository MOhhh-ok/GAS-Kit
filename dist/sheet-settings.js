"use strict";
/**
 * シートから設定を読み込むクラス
 */
class SheetSettings {
    /**
     *
     * @param sheetName
     * @param depth // データ階層レベル
     */
    constructor(sheetName, depth = 2) {
        this.data = {};
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) {
            throw new Error(`シートが見つかりませんでした。` + sheetName);
        }
        this.sheet = sheet;
        this.depth = depth;
        const values = sheet.getDataRange().getValues();
        this.data = {};
        let tmpRow = [];
        for (const row of values) {
            row.splice(depth, row.length - depth);
            for (let i = 0; i < row.length; i++) {
                tmpRow[i] = row[i] ? row[i] : tmpRow[i];
            }
            this.assign(this.data, tmpRow);
        }
    }
    /**
     * オブジェクトに階層的に値をセットする
     */
    assign(obj, args) {
        if (args.length === 0) {
            return;
        }
        let tmp = obj;
        for (let i = 0; i < args.length - 2; i++) {
            tmp = tmp[args[i]] = tmp[args[i]] ? tmp[args[i]] : {};
        }
        tmp[args[args.length - 2]] = args[args.length - 1];
    }
    get(...keys) {
        let tmp = this.data;
        for (const key of keys) {
            tmp = tmp[key];
        }
        return tmp;
    }
}
function sheetSettingsTest() {
    const a = new SheetSettings('設定', 3);
    Logger.log(JSON.stringify(a.data, null, 2));
}
