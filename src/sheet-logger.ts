class SheetLogger {
    sheet: GoogleAppsScript.Spreadsheet.Sheet;

    constructor(args: {
        sheet?: GoogleAppsScript.Spreadsheet.Sheet,
        maxNum?: number,
    }) {
        if (!args.sheet) {
            throw new Error('sheetが指定されていません。');
        }
        this.sheet = args.sheet;

        // ログの最大数を超えていたら古いログを削除する
        const rows = this.sheet.getLastRow();
        const maxNum = args.maxNum || 100;
        if (rows > maxNum) {
            this.sheet.deleteRows(1, maxNum - rows);
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

    // console.log時に呼ばれるようにする
    hookConsole() {
        const self = this;
        const originalLog = console.log;
        console.log = function (text: string) {
            originalLog.apply(console, arguments);
            self.log(text);
        } as Console['log'];
    }
}
