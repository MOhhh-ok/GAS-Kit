"use strict";
/**
 * Googleカレンダーから祝日情報を取得
 */
const Holidays = {
    /** 前後それぞれ十年。なぜか全ては取れない */
    PAST_DAYS: 1000 * 60 * 60 * 24 * 365 * 10,
    FORWARD_DAYS: 1000 * 60 * 60 * 24 * 365 * 10,
    CALENDAR_NAME: '日本の祝日',
    TIMEZONE: 'JST',
    FORMAT: 'yyyy-MM-dd',
    holidays: new Map(),
    inited: false,
    /** 日付をフォーマット */
    format(date) {
        return Utilities.formatDate(date, this.TIMEZONE, this.FORMAT);
    },
    /** 祝日判定 */
    isHoliday(date = new Date()) {
        return this.holidays.has(this.format(date));
    },
    /** 曜日文字列生成 */
    makeWeekStr(date = new Date()) {
        if (!date) {
            return '';
        }
        return this.isHoliday(date)
            ? '祝'
            : '日,月,火,水,木,金,土'.split(',')[date.getDay()];
    },
    /** 初期化 */
    init: function () {
        if (this.inited) {
            return;
        }
        this.inited = true;
        const today = new Date();
        const startDate = new Date(today.getTime() - this.PAST_DAYS);
        const endDate = new Date(today.getTime() - 0 + this.FORWARD_DAYS);
        /** カレンダーから取得 */
        const holidayCalendar = CalendarApp.getCalendarsByName(this.CALENDAR_NAME)[0];
        const events = holidayCalendar.getEvents(startDate, endDate);
        /** それぞれで処理 */
        for (let e of events) {
            const t = e.getStartTime();
            this.holidays.set(this.format(t), {
                title: e.getTitle(),
                year: t.getFullYear(),
                month: t.getMonth() + 1,
                day: t.getDate(),
            });
        }
        /** ログ出力 */
        const dates = [...this.holidays.keys()];
        Logger.log('got holidays from ' + dates[0] + ' to ' + dates[dates.length - 1]);
    }
};
