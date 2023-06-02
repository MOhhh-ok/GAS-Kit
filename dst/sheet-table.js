"use strict";
/**
 * シートをテーブルとして扱うクラス
 */
class SheetTable {
    // コンストラクタ
    constructor(args) {
        if (!args.sheet) {
            throw new Error(`シートが見つかりませんでした。`);
        }
        this.sheet = args.sheet;
        this.headRowNum = args.headRowNum;
        this.header = this.sheet.getRange(this.headRowNum, 1, 1, this.sheet.getLastColumn()).getValues()[0];
    }
    // キーから列番号を取得する
    getColNum(key) {
        const colIndex = this.header.indexOf(key);
        if (colIndex < 0) {
            throw new Error(`ヘッダーに${key}が見つかりませんでした。`);
        }
        return colIndex + 1;
    }
    // データの範囲を取得する
    getBodyRange() {
        return this.sheet.getRange(this.headRowNum + 1, 1, this.sheet.getLastRow() - this.headRowNum, this.sheet.getLastColumn());
    }
    // データを取得する
    getObjects(ops) {
        const range = this.getBodyRange();
        let rows;
        if (ops && ops.displayValue) {
            rows = range.getDisplayValues();
        }
        else {
            rows = range.getValues();
        }
        // ヘッダーと合わせてオブジェクトにする
        const objects = rows.map((row, idx) => {
            const obj = {};
            if (ops && ops.includeRow) {
                // 行番号を含める
                obj['row'] = idx + this.headRowNum + 1;
            }
            // ヘッダーと合わせる
            this.header.forEach((key, i) => {
                obj[key] = row[i];
            });
            return obj;
        });
        return objects;
    }
    // データを追加する
    addObjects(objects) {
        const newRows = objects.map(obj => {
            const row = this.header.map(key => obj[key]);
            return row;
        });
        const range = this.sheet.getRange(this.sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length);
        range.setValues(newRows);
    }
    // データを更新する
    updateObject(object, row) {
        const colNums = this.header.map(key => this.getColNum(key));
        const range = this.sheet.getRange(row, 1, 1, colNums.length);
        const values = [colNums.map(colNum => object[this.header[colNum - 1]])];
        range.setValues(values);
    }
    // データを削除する
    deleteRows(rows) {
        const rows2 = [...rows]; // コピーする
        rows2.sort((a, b) => b - a); // 降順にソートする
        rows2.forEach(row => {
            this.sheet.deleteRow(row);
        });
    }
    // データ範囲をソートする
    sort(ops) {
        const colNum = this.getColNum(ops.key);
        this.getBodyRange().sort({
            column: colNum,
            ascending: ops.ascending,
        });
    }
}
