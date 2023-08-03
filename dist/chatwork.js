"use strict";
class ChatWork {
    constructor(token) {
        const prop = PropertiesService.getScriptProperties();
        this.token = token || prop.getProperty('CHATWORK_API_TOKEN') || '';
    }
    send(roomId, msg) {
        const url = `https://api.chatwork.com/v2/rooms/${roomId}/messages`;
        const options = {
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
