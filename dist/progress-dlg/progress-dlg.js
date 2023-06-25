"use strict";
/****************************************************************
 * Edit below. SpreadsheetApp, DocumentApp, SlidesApp, or FormApp;
 */
const APP = SpreadsheetApp;
/**
 * Progress class
 */
class ProgressDlg {
    // init
    constructor(args) {
        var _a;
        // singleton
        if (ProgressDlg.instance) {
            throw new Error('Progress is singleton. Use Progress.instance');
        }
        ProgressDlg.instance = this;
        // property
        this.Prop = PropertiesService.getUserProperties();
        this.PropKey = 'ProgressData';
        // ui
        this.Ui = APP.getUi();
        // from html
        if (args.fromHtml) {
            this.data = this.loadData();
            return;
        }
        // data
        this.data = {
            total: (_a = args.total) !== null && _a !== void 0 ? _a : 0,
            progress: 0,
            log: '',
            fin: false,
        };
        this._saveData();
    }
    // load from property
    loadData() {
        var _a;
        const dataStr = (_a = this.Prop.getProperty(this.PropKey)) !== null && _a !== void 0 ? _a : '{}';
        this.data = JSON.parse(dataStr);
        return Object.assign({}, this.data);
    }
    // save to property
    _saveData() {
        this.Prop.setProperty(this.PropKey, JSON.stringify(this.data));
    }
    // check progress number
    _checkProgress() {
        if (this.data.total <= this.data.progress) {
            this.fin();
        }
    }
    // finish
    fin() {
        this.data.fin = true;
        this._saveData();
    }
    // add total number
    addTotal(total) {
        this.data.total += total;
        this._saveData();
    }
    // set total number
    setTotal(total) {
        this.data.total = total;
        this._saveData();
    }
    // increment progress number
    incrementProgress() {
        this.data.progress++;
        this._checkProgress();
        this._saveData();
    }
    // set progress number
    setProgress(now) {
        this.data.progress = now;
        this._checkProgress();
        this._saveData();
    }
    // log
    log(str) {
        this.data.log += str + '\n';
        this._saveData();
    }
    // show dialog
    show(title = 'Now processing. Don\'t close this window...') {
        // if trigger, not show dialog
        if (!this.Ui) {
            return;
        }
        this.Ui.showModalDialog(HtmlService.createHtmlOutputFromFile('progress-dlg'), title);
    }
}
/**
 * global function. call from html
 */
function progressDlgGetData() {
    const progress = new ProgressDlg({ fromHtml: true });
    return progress.loadData();
}
/**
 * test
 */
function progressTest() {
    const progress = new ProgressDlg({
        total: 5,
    });
    progress.show('Now processing. Don\'t close this window...');
    for (let i = 0; i < 5; i++) {
        progress.incrementProgress();
        progress.log('log ' + i);
        Utilities.sleep(1000);
    }
    progress.fin();
}
