class SheetLogger {
    sheet: GoogleAppsScript.Spreadsheet.Sheet;
    singleLineRange: GoogleAppsScript.Spreadsheet.Range | null = null;
    singleLineSeparator: string = '';

    constructor(args: {
        sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
        maxNum?: number,
        singleLine?: boolean,
        singleLineSeparator?: string,
    }) {
        if (!args.sheet) {
            throw new Error('sheetがありません。');
        }
        this.sheet = args.sheet;

        // シングルラインモード
        if (args.singleLine) {
            this.addLine();
        }

        // シングルラインのセパレータ
        this.singleLineSeparator = args.singleLineSeparator || '';

        // ログの最大数を超えていたら古いログを削除する
        const rows = this.sheet.getLastRow();
        const maxNum = args.maxNum || 100;
        if (rows > maxNum) {
            this.sheet.deleteRows(1, rows - maxNum);
        }
    }

    log(text: string) {
        if (this.singleLineRange) {
            const value = this.singleLineRange.getValue() + text;
            this.singleLineRange.setValue(value);
        } else {
            this.sheet.appendRow([new Date(), text]);
        }
    }

    addLine(text?: string) {
        this.sheet.appendRow([new Date()]);
        const lastRowNum = this.sheet.getLastRow();
        const target = this.sheet.getRange(lastRowNum, 2);
        if (text) {
            target.setValue(text);
        }
        this.singleLineRange = target;
    }

    // Logger.log時に呼ばれるようにする
    hookLogger() {
        const self = this;
        const originalLog = Logger.log;
        Logger.log = function (text: string) {
            //originallob bind
            originalLog.bind(Logger)(text);
            self.log(text);
        } as any;
    }
}


function sheetLoggerTest() {
    const id = PropertiesService.getScriptProperties().getProperty('TEST_SHEET_ID');
    if (!id) throw new Error('TEST_SHEET_IDがありません。');

    const ss = SpreadsheetApp.openById(id);
    const aaa = new SheetLogger({
        sheet: ss.getSheetByName('logs') || ss.insertSheet('logs'),
        maxNum: 10,
        singleLine: false,
    });

    aaa.hookLogger();
    Logger.log('aiueo');
    Logger.log('kaikukeko');
}