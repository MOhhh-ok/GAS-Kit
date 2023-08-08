type SheetTableObject = Record<string, any>;

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

    /**
     * 指定項目でマップを生成
     */
    static createMap(keyName: keyof SheetTableObject, objects: SheetTableObject[]): Map<string, SheetTableObject> {
        const map = new Map();
        for (const obj of objects) {
            const id = obj[keyName];
            if (!id) continue;
            map.set(String(id), obj);
        }
        return map;
    }

    /**
     * オブジェクトリストを指定キーで結合する。外部結合
     */
    static joinObjects(idKey: keyof SheetTableObject, ...objectsList: SheetTableObject[][]) {
        objectsList = [...objectsList];
        let result: SheetTableObject[] = objectsList.shift() || [];
        result = [...result];

        let objects;
        while (objects = objectsList.shift()) {
            const map = SheetTable.createMap(idKey, objects);
            for (const obj of result) {
                const id = obj[idKey];
                if (!id) continue;
                const obj2 = map.get(String(id)) || {};
                map.delete(String(id));
                Object.assign(obj, obj2);
            }
            for (const obj of map.values()) {
                result.push(Object.assign({}, obj));
            }
        }
        return result;
    }


    /**
     * キーから列番号を取得する
     */
    getColNum(key: string): number {
        const newKey = this.replacements[key] || key;
        const colIndex = this.header.indexOf(newKey);
        if (colIndex < 0) {
            throw new Error(`ヘッダーに${newKey}が見つかりませんでした。`);
        }
        return colIndex + 1;
    }

    /**
     * データの範囲を取得する
     */
    getBodyRange(): GoogleAppsScript.Spreadsheet.Range | null {
        const numRows = this.sheet.getLastRow() - this.headRowNum;
        const numCols = this.sheet.getLastColumn();
        if (numRows <= 0 || numCols == 0) return null;
        return this.sheet.getRange(this.headRowNum + 1, 1, numRows, numCols);
    }

    /**
     * ボディーを削除する
     */
    clearBodyContents() {
        this.getBodyRange()?.clear({ contentsOnly: true });
    }

    /**
     * すべてを削除する
     */
    clearAllContents() {
        this.sheet.getDataRange().clear({ contentsOnly: true });
    }

    /**
     * データを取得する
     */
    getObjects(ops?: {
        displayValue?: boolean, // 表示値を取得するかどうか
        includeRow?: boolean, // 行番号を含めるかどうか
        rowColName?: string, // 行番号のキー名。省略時はrow
    }): SheetTableObject[] {

        const range = this.getBodyRange();
        if (!range) return [];

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
                obj[ops.rowColName || 'row'] = idx + this.headRowNum + 1;
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


    /**
     * データを追加する
     */
    addObjects(objects: SheetTableObject[], options?: {
        colStart?: number, // 開始列番号。省略時は1
        colCount?: number, // 何列処理するか。省略時は最後列まで
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

        // ヘッダーがなければエラー
        if (this.header.length == 0) {
            throw new Error('ヘッダーがありません。' + this.sheet.getName());
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


    /**
     * IDを基準に全体データを更新する
     */
    updateObjects(idColName: string, newObjects: SheetTableObject[], ops?: {
        expand?: boolean, // テーブル列を拡張するかどうか
        deleteNotInUpdated?: boolean, // 更新データにないデータを削除するかどうか
    }) {

        LockService.getScriptLock().waitLock(10000);

        // 既存データと新しいデータを結合
        let joinedObjects = SheetTable.joinObjects(idColName, this.getObjects(), newObjects);

        // 指定があれば
        if (ops?.deleteNotInUpdated) {
            // 更新データにないデータを削除する
            const ids = new Set(newObjects.map(obj => obj[idColName]));
            joinedObjects = joinedObjects.filter(obj => ids.has(obj[idColName]));
        }

        // テーブルデータを削除してから追加する
        this.clearBodyContents();
        this.addObjects(joinedObjects, ops);

        LockService.getScriptLock().releaseLock();
    }


    /**
     * ヘッダを含めて新規にテーブルを書き込む
     */
    writeNewTable(objects: SheetTableObject[]) {
        this.clearAllContents();

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

    // データを別シートにコピーする。シートコピーメソッドはシートのアクティベートが必要なため代替手段
    copyToSheet(ops: {
        dstSheet?: GoogleAppsScript.Spreadsheet.Sheet,
        dstSheetName?: string,
    }) {

        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let dstSheet = ops.dstSheet;

        if (!dstSheet) {
            if (!ops.dstSheetName) throw new Error('シートが指定されていません。');
            dstSheet = ss.getSheetByName(ops.dstSheetName) || ss.insertSheet(ops.dstSheetName);
        }

        dstSheet.getDataRange().clear();

        const srcRange = this.sheet.getDataRange();
        const dstRange = dstSheet.getRange(1, 1, srcRange.getNumRows(), srcRange.getNumColumns());
        srcRange.copyTo(dstRange);
    }

    // データ範囲をソートする
    sort(ops: {
        key: string, // 項目名
        ascending?: boolean // 昇順かどうか
    }) {
        const colNum = this.getColNum(ops.key);
        const range = this.getBodyRange();
        if (!range) return;

        range.sort({
            column: colNum,
            ascending: ops.ascending,
        });
    }
}


function sheetTableTest2() {
    const a = [{ k: 10, a: 1 }, { k: 20, a: 3, b: 4 }];
    const b = [{ k: 20, a: 5, b: 6 }, { a: 3, b: 4 }];
    const c = [{ k: 30, a: 8, b: 9 }, { a: 3, b: 4 }];

    const result = SheetTable.joinObjects('k', a, b, c);
    Logger.log(result);
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

    table.updateObjects('name', data, { expand: true, deleteNotInUpdated: true });
}

