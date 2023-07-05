class ChatWork {
    token: string;

    constructor(token?: string) {
        const prop = PropertiesService.getScriptProperties();
        this.token = token || prop.getProperty('CHATWORK_API_TOKEN') || '';
    }

    send(roomId: number, msg: string) {
        const url = `https://api.chatwork.com/v2/rooms/${roomId}/messages`;
        const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            method: 'post',
            headers: {
                'X-ChatWorkToken': this.token,
            },
            payload: {
                body: msg,
            },
        };
        Logger.log(JSON.stringify(options.payload, null, 2));
        const res = UrlFetchApp.fetch(url, options);
        const txt = res.getContentText();
        Logger.log(txt);
        return txt;
    }
}


function chatWorkTest() {
    const roomId = 328904318;
    const cw = new ChatWork();
    cw.send(roomId, 'test');
}