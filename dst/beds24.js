"use strict";
const Beds24Rooms = {
    Single: 1,
    Double: 2,
    Triple: 3,
    Quadruple: 4,
    Suite: 5,
    Apartment: 6,
    Family: 7,
    Twin: 8,
    TwinDouble: 9,
    BedInDormitory: 10,
    DormitoryRoom: 11,
    Studio: 12,
    Bungalow: 13,
    Chalet: 14,
    HolidayHome: 15,
    Villa: 16,
    MobileHome: 17,
    Tent: 18,
    CampSite: 19,
    Activity: 20,
    Tour: 21,
    CarRental: 22,
};
const Beds24Status = {
    0: 'Cancelled',
    1: 'Confirmed',
    2: 'New',
    3: 'Request',
    4: 'Black',
    5: 'Inquiry',
};
const Beds24SubStatus = {
    blank: 0,
    ActionRequired: 1,
    Allotment: 2,
    CancelledByGuest: 3,
    CancelledByHost: 4,
    NoShow: 5,
    Waitlist: 6,
    Walkin: 7,
};
const Beds24Errors = {
    1009: "Not allowed for this role",
    1010: "No write access",
    1016: "Usage limit exceeded in last 5 minutes",
    1020: "Usage limit exceeded in last 5 minutes",
    1021: "Account has no credit",
    1022: "Not whitelisted",
};
class MyBeds24 {
    constructor(args = {
        name: '',
        apiKey: '',
        propKey: '',
    }) {
        this.apiKey = args.apiKey;
        this.propKey = args.propKey;
    }
    makeOps(payload) {
        return {
            method: "POST",
            payload: JSON.stringify(payload),
        };
    }
    static toTwoDigit(n = 0) {
        return n < 10 ? "0" + n : n.toString();
    }
    static dateToStr(date = new Date(), includeTime = false) {
        //"20131001 12:30:00"
        const y = date.getFullYear();
        const m = MyBeds24.toTwoDigit(date.getMonth() + 1);
        const d = MyBeds24.toTwoDigit(date.getDate());
        const h = MyBeds24.toTwoDigit(date.getHours());
        const min = MyBeds24.toTwoDigit(date.getMinutes());
        const sec = MyBeds24.toTwoDigit(date.getSeconds());
        let result = y + m + d;
        if (includeTime) {
            result += ' ' + h + ':' + min + ':' + sec;
        }
        return result;
    }
    getData(url, payload) {
        const res = UrlFetchApp.fetch(url, this.makeOps(payload));
        const text = res.getContentText();
        const data = JSON.parse(text);
        if (data.error) {
            const errString = `${data.error} errorCode:${data.errorCode}`;
            throw new Error(errString);
        }
        if (data.length >= 999) {
            throw new Error('1000を超えるデータは取得できません（APIの制限）。\nスクリプトを拡張してください');
        }
        return data;
    }
    /** ブッキング情報を取得
     * @param{Date} - modSince 指定しない場合はnullを入れる（デフォルト値の関係）
     */
    getBookings(modSince = new Date(), ops) {
        if (ops && ops.debug) {
            return ops.debug;
        }
        ops = Object.assign({
            "authentication": {
                "apiKey": this.apiKey,
                "propKey": this.propKey,
            },
            "includeInvoice": false,
            "includeInfoItems": false,
        }, ops);
        /** 取得最小更新日を設定 */
        if (modSince && modSince.getTime) {
            /** ずれる可能性？とタイムゾーン周りが不明のためmodSinceを1日早める */
            modSince = new Date(modSince.getTime() - (1000 * 60 * 60 * 24));
            const s = MyBeds24.dateToStr(modSince, true);
            ops.modifiedSince = s;
            Logger.log(`setting modified since ${s}`);
        }
        const result = this.getData('https://www.beds24.com/api/json/getBookings', ops) || [];
        Logger.log('API:' + result.length + '件');
        return result;
    }
    getProperties() {
        let result = this.getData('https://www.beds24.com/api/json/getProperties', {
            "authentication": {
                "apiKey": this.apiKey,
            }
        });
        result = result.getProperties || [];
        return result;
    }
}
function myBeds24Test() {
    Logger.log(MyBeds24.dateToStr(new Date(), true));
}
