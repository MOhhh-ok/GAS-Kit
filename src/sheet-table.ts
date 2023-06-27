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
    replacements: { [key: string]: string };

    /**
     * コンストラクタ
     * @param args 以下のプロパティ
     * - sheet?: GoogleAppsScript.Spreadsheet.Sheet | null
     *     シートオブジェクト。無い場合はsheetNameから取得する
     * - headRowNum?: number
     *     ヘッダー行番号。デフォルトは1
     * - sheetName?: string
     *     シート名。無い場合はエラー
     * - replacements?: {}
     *     ヘッダー置換リスト。keyはデータキー、valueは置換後のシートヘッダー
     */
    constructor(args: {
        sheet?: GoogleAppsScript.Spreadsheet.Sheet | null,
        headRowNum?: number,
        sheetName?: string,
        replacements?: {},
    }) {

        if (!args.sheet) {
            // シートオブジェクト無しの場合

            if (!args.sheetName) {
                // シート名が指定されていない場合はエラー
                throw new Error(`シート名が指定されていません。`);
            }

            // シート名から取得
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            this.sheet = ss.getSheetByName(args.sheetName) || ss.insertSheet(args.sheetName);

        } else {
            // シートオブジェクトがある場合
            this.sheet = args.sheet;
        }

        // ヘッダー置換リスト
        this.replacements = args.replacements || {};

        // ヘッダー行番号。デフォルトは1
        this.headRowNum = args.headRowNum || 1;

        // ヘッダーを取得する
        const lastCol = this.sheet.getLastColumn();
        this.header = lastCol
            ? this.sheet.getRange(this.headRowNum, 1, 1, lastCol).getValues()[0]
            : [];
    }

    // 逆置換リストを取得する
    private getInvertedReplacements(): { [key: string]: string } {
        const inverted: { [key: string]: string } = {};
        for (const [key, value] of Object.entries(this.replacements)) {
            inverted[value] = key;
        }
        return inverted;
    }

    // キーを置換する
    private replaceKeys(objects: SheetTableObject[], replacements: { [key: string]: string })
        : SheetTableObject[] {

        const newObjects = [];
        for (const obj of objects) {
            const newO: { [key: string]: string } = {};
            for (const [key, value] of Object.entries(obj)) {
                const newKey = replacements[key] || key;
                newO[newKey] = value;
            }
            newObjects.push(newO);
        }
        return newObjects;
    }

    // キーをシート用に置換する
    private replaceKeysToSheet(objects: SheetTableObject[]): SheetTableObject[] {
        return this.replaceKeys(objects, this.replacements);
    }

    // シート用のキーを元に戻す
    private replaceKeysFromSheet(objects: SheetTableObject[]): SheetTableObject[] {
        const inverted = this.getInvertedReplacements();
        return this.replaceKeys(objects, inverted);
    }

    // オブジェクトリストから重複無しキーリストを取得する
    private getKeysFromObjects(objects: SheetTableObject[]): string[] {
        const headerSet = new Set<string>();
        objects.forEach(object => Object.keys(object).forEach(key => headerSet.add(key)));
        return [...headerSet];
    }

    // キーから列番号を取得する
    getColNum(key: string): number {
        const newKey = this.replacements[key] || key;
        const colIndex = this.header.indexOf(newKey);
        if (colIndex < 0) {
            throw new Error(`ヘッダーに${newKey}が見つかりませんでした。`);
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

        // キーを元に戻して返す
        return this.replaceKeysFromSheet(objects);
    }

    // データを追加する
    addObjects(objects: SheetTableObject[], options?: {
        colStart?: number, // 開始列番号
        colCount?: number, // 何列処理するか
        expand?: boolean, // テーブルを拡張するかどうか
    }) {
        if (objects.length === 0) return;

        // キーをシート用に置換する
        const newObjects = this.replaceKeysToSheet(objects);

        // ヘッダーを拡張するかどうか
        if (options?.expand) {

            // ヘッダーを拡張する
            const expandHeader = this.getKeysFromObjects(newObjects);
            for (const h of expandHeader) {
                if (!this.header.includes(h)) {
                    // ヘッダーに追加
                    this.header.push(h);
                }
            }
        }

        // 列範囲。指定がなければすべての範囲を計算する
        const colStart = options?.colStart || 1;
        const colCount = options?.colCount || this.header.length - colStart + 1;

        // ２次元配列
        const newRows = newObjects.map(obj => {
            // １次元配列
            const row = this.header.map(key => obj[key]);
            return row.slice(colStart - 1, colCount);
        });

        // ヘッダ書き込み
        this.sheet.getRange(this.headRowNum, colStart, 1, colCount).setValues(
            [this.header.slice(colStart - 1, colCount)]
        );

        // データ書き込み
        const range = this.sheet.getRange(this.sheet.getLastRow() + 1, colStart, newRows.length, colCount);
        range.setValues(newRows);
    }

    // 行番号指定でデータを更新する
    updateObject(object: SheetTableObject, row: number) {

        // キーをシート用に置換する
        const newObject = this.replaceKeysToSheet([object])[0];

        // ヘッダーと合わせて１次元配列にする
        const newRow = this.header.map(key => newObject[key] || '');

        // 更新する
        const range = this.sheet.getRange(row, 1, 1, newRow.length);
        range.setValues([newRow]);
    }


    // ヘッダを含めて新規にテーブルを書き込む
    writeNewTable(objects: SheetTableObject[]) {
        this.sheet.getDataRange().clear({ contentsOnly: true });

        // キーをシート用に置換する
        const newObjects = this.replaceKeysToSheet(objects);

        // ヘッダーを取得する
        this.header = this.getKeysFromObjects(newObjects);

        if (this.header.length == 0) return;
        this.sheet.getRange(this.headRowNum, 1, 1, this.header.length).setValues([this.header]);
        this.addObjects(newObjects);
    }

    // 行番号でデータを削除する
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