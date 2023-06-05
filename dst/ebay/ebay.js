"use strict";
var EbayOperations;
(function (EbayOperations) {
    EbayOperations["FindItemsByKeywords"] = "findItemsByKeywords";
    EbayOperations["FindItemsAdvanced"] = "findItemsAdvanced";
})(EbayOperations || (EbayOperations = {}));
class Ebay {
    constructor() {
        const prop = PropertiesService.getScriptProperties();
        this.appId = prop.getProperty('EBAY_APP_ID') || '';
        this.devId = prop.getProperty('EBAY_DEV_ID') || '';
        this.certId = prop.getProperty('EBAY_CERT_ID') || '';
        this.serviceVersion = '1.13.0'; // normally use latest version
    }
    /**
     * GETパラメータ生成
     */
    queryString(obj) {
        const result = [];
        for (let [key, value] of Object.entries(obj)) {
            result.push(`${key}=${encodeURIComponent(String(value))}`);
        }
        return result.join('&');
    }
    /** Find */
    findingService(operation, ops) {
        ops = Object.assign({
            'OPERATION-NAME': operation,
            'SERVICE-VERSION': this.serviceVersion,
            'SECURITY-APPNAME': this.appId,
            'RESPONSE-DATA-FORMAT': 'JSON',
            'REST-PAYLOAD': '',
        }, ops);
        const url = 'http://svcs.ebay.com/services/search/FindingService/v1?' + this.queryString(ops);
        const ret = UrlFetchApp.fetch(url);
        const txt = ret.getContentText();
        return JSON.parse(txt);
    }
    /** by Seller */
    findItemsBySeller(seller) {
        const ops = {
            'itemFilter(0).name': 'Seller',
            'itemFilter(0).value(0)': seller,
            'itemFilter(1).name': 'LocatedIn',
            'itemFilter(1).value': 'WorldWide',
        };
        return this.findingService(EbayOperations.FindItemsByKeywords, ops);
    }
}
function MyEbayTest() {
    const aaa = new Ebay();
    console.log(aaa.findItemsBySeller('closer0924'));
}
