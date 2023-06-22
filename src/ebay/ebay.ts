enum EbayOperations {
    FindItemsByKeywords = 'findItemsByKeywords',
    FindItemsAdvanced = 'findItemsAdvanced',
}

class Ebay {
    appId: string;
    devId: string;
    certId: string;
    serviceVersion: string;

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
    queryString(obj: {}) {
        const result = [];
        for (let [key, value] of Object.entries(obj)) {
            result.push(`${key}=${encodeURIComponent(String(value))}`);
        }
        return result.join('&');
    }

    /** Find */
    findingService(operation: EbayOperations, ops: {}) {
        ops = Object.assign({
            'OPERATION-NAME': operation,
            'SERVICE-VERSION': this.serviceVersion,
            'SECURITY-APPNAME': this.appId,
            'RESPONSE-DATA-FORMAT': 'JSON',
            'REST-PAYLOAD': 'true',
        }, ops);
        const url = 'https://svcs.ebay.com/services/search/FindingService/v1?' + this.queryString(ops);
        const ret = UrlFetchApp.fetch(url);
        const txt = ret.getContentText();
        return JSON.parse(txt);
    }

    /** by Seller */
    findItemsBySeller(seller: string) {
        const ops = {
            'itemFilter(0).name': 'Seller',
            'itemFilter(0).value(0)': seller,
            'itemFilter(1).name': 'LocatedIn',
            'itemFilter(1).value': 'WorldWide',
        }
        return this.findingService(EbayOperations.FindItemsByKeywords, ops);
    }
}


function ebayTest() {
    const aaa = new Ebay();
    const items = aaa.findingService(EbayOperations.FindItemsAdvanced, {
        Seller: 'miyako_sunrise',
        AvailableTo: 'US',
        // keywords: 'tolkien',
    });
    console.log(JSON.stringify(items, null, 2));
}

function ebayTest2() {
    const appId = PropertiesService.getScriptProperties().getProperty('EBAY_APP_ID');
    const url = 'https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=' + appId + '&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD=true&paginationInput.entriesPerPage=2&keywords=tolkien';
    const res = UrlFetchApp.fetch(url);
    const txt = res.getContentText();
    console.log(txt);
}