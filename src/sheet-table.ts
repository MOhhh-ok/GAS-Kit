type SheetTableObject = {
    [key: string]: any
}

/**
 * シートをテーブルとして扱うクラス
 */
class SheetTable {
    sheet: GoogleAppsScript.Spreadsheet.Sheet;
    headRowNum: number;
    header: string[];

    // コンストラクタ
    constructor(args: {
        sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
        headRowNum: number,
    }) {
        if (!args.sheet) {
            throw new Error(`シートが見つかりませんでした。`);
        }
        this.sheet = args.sheet;
        this.headRowNum = args.headRowNum;

        const lastCol = this.sheet.getLastColumn();

        this.header = lastCol
            ? this.sheet.getRange(this.headRowNum, 1, 1, this.sheet.getLastColumn()).getValues()[0]
            : [];
    }

    // キーから列番号を取得する
    getColNum(key: string): number {
        const colIndex = this.header.indexOf(key);
        if (colIndex < 0) {
            throw new Error(`ヘッダーに${key}が見つかりませんでした。`);
        }
        return colIndex + 1;
    }

    // データの範囲を取得する
    getBodyRange(): GoogleAppsScript.Spreadsheet.Range {
        return this.sheet.getRange(this.headRowNum + 1, 1, this.sheet.getLastRow() - this.headRowNum, this.sheet.getLastColumn());
    }

    // ボディーを削除する
    clearBodyContents() {
        this.getBodyRange().clear({ contentsOnly: true });
    }

    // データを取得する
    getObjects(ops?: {
        displayValue?: boolean, // 表示値を取得するかどうか
        includeRow?: boolean, // 行番号を含めるかどうか
    }): SheetTableObject[] {

        const range = this.getBodyRange();
        let rows: any[][];

        if (ops && ops.displayValue) {
            rows = range.getDisplayValues();
        } else {
            rows = range.getValues();
        }

        // ヘッダーと合わせてオブジェクトにする
        const objects = rows.map((row, idx) => {
            const obj: any = {};

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
    addObjects(objects: SheetTableObject[], options?: {
        colStart?: number, // 開始列番号
        colCount?: number, // 何列処理するか
    }) {
        if (objects.length === 0) return;

        const colStart = options?.colStart || 1;
        const colCount = options?.colCount || this.header.length - colStart + 1;

        // 行配列の配列
        const newRows = objects.map(obj => {
            // 行配列
            const row = this.header.map(key => obj[key]);
            return row.slice(colStart - 1, colCount);
        });

        const range = this.sheet.getRange(this.sheet.getLastRow() + 1, colStart, newRows.length, colCount);
        range.setValues(newRows);
    }

    // データを更新する
    updateObject(object: SheetTableObject, row: number) {
        const colNums = this.header.map(key => this.getColNum(key));
        const range = this.sheet.getRange(row, 1, 1, colNums.length);
        const values = [colNums.map(colNum => object[this.header[colNum - 1]])];
        range.setValues(values);
    }

    private _ObjectsToHeader(objects: SheetTableObject[]): string[] {
        const headerSet = new Set<string>();
        objects.forEach(object => Object.keys(object).forEach(key => headerSet.add(key)));
        return [...headerSet];
    }

    // ヘッダを含めて新規にテーブルを書き込む
    writeNewTable(objects: SheetTableObject[]) {
        this.sheet.getDataRange().clear({ contentsOnly: true });
        this.header = this._ObjectsToHeader(objects);
        if (this.header.length == 0) return;
        this.sheet.getRange(this.headRowNum, 1, 1, this.header.length).setValues([this.header]);
        this.addObjects(objects);
    }

    // データを削除する
    deleteRows(rows: number[]) {
        const rows2 = [...rows]; // コピーする
        rows2.sort((a, b) => b - a); // 降順にソートする
        rows2.forEach(row => {
            this.sheet.deleteRow(row);
        });
    }

    // データ範囲をソートする
    sort(ops: {
        key: string, // 項目名
        ascending?: boolean // 昇順かどうか
    }) {
        const colNum = this.getColNum(ops.key);
        this.getBodyRange().sort({
            column: colNum,
            ascending: ops.ascending,
        });
    }
}

function sheetTableTest() {
    const prop = PropertiesService.getScriptProperties();
    const ss = SpreadsheetApp.openById(prop.getProperty('TEST_SHEET_ID') || '');
    if (!ss) {
        throw new Error('スプレッドシートが見つかりませんでした。');
    }

    const sheetName = 'sheetTableTest';
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    const headRowNum = 1;

    const table = new SheetTable({ sheet, headRowNum });

    const data = [
        { name: 'a', value: 1 },
        { name: 'b', value: 2 },
        { name: 'c', value: 3 },
    ];

    table.writeNewTable(data);
}