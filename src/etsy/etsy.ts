
class Etsy {
    apiKey: string;
    apiSecret: string;

    constructor() {
        const prop = PropertiesService.getScriptProperties();

        this.apiKey = prop.getProperty('ETSY_API_KEY') || '';
        this.apiSecret = prop.getProperty('ETSY_API_SECRET') || '';

        if (!this.apiKey) {
            throw new Error('ETSY_API_KEY is not set.');
        }
    }

    makeOptions(method: GoogleAppsScript.URL_Fetch.HttpMethod, useOAuth: boolean = false) {
        const result: { [key: string]: any } = {
            'method': method,
            'headers': {
                'x-api-key': this.apiKey,
            },
        };
        if (useOAuth) {
            result['headers']['Authorization'] = 'Bearer ' + this.getToken();
        }
        return result;
    }

    getToken() {
        const auth = new EtsyOAuth();
        return auth.getService().getAccessToken();
    }

    requestJson(
        method: GoogleAppsScript.URL_Fetch.HttpMethod,
        urlPath: string,
        ops?: {
            useOAuth: boolean, // Default: false
            payload?: {},
        }) {

        ops = ops || { useOAuth: false };

        const options = this.makeOptions(method, ops.useOAuth);
        const url = "https://api.etsy.com/v3/" + urlPath;
        console.log(method + ' ' + url);

        const response = UrlFetchApp.fetch(url, options);
        const txt = response.getContentText();
        const json = JSON.parse(txt);
        return json;
    }

    getUsers() {
        const data = this.requestJson("get", "application/provisional-users");
        console.log(JSON.stringify(data, null, 2));
        //GET application/provisional-users
        // Returns all provisional users currently added for your application. Initially, this will be an empty list, []. This list does not include the user who owns the application, so seeing an empty list does not indicate that you can no longer authenticate as the application owner.
    }

    addUser(userId: number) {
        const data = this.requestJson("post", "application/provisional-users/:" + userId);
        console.log(JSON.stringify(data, null, 2));
    }

    getUserId(profileUrl: string) {
        const html = UrlFetchApp.fetch(profileUrl).getContentText();
        const match = html.match(/"user_id":\s*(\d+)/);
        if (!match) {
            throw new Error("user_id not found");
        }
        return match[1];
    }

    // require oauth
    getListingsByShop(shopId: string) {
        const path = "application/shops/" + shopId + "/listings";
        const json = this.requestJson("get", path, { useOAuth: true });
        console.log(JSON.stringify(json, null, 2));
    }

    findAllActiveListingsByShop(shopId: string, params: findAllActiveListingsByShopRequest = {}): findAllActiveListingsByShopResponse {
        const path = "application/shops/" + shopId + "/listings/active";
        const json = this.requestJson("get", path);
        return json;
    }

}

function etsyTest() {
    const test = new Etsy();
    const data = test.findAllActiveListingsByShop("14355593");
    console.log(JSON.stringify(data, null, 2));
    return;
    test.getUsers();
    test.addUser(123);
    test.getUsers();
}