"use strict";
class ChatWork {
    constructor(token) {
        const prop = PropertiesService.getScriptProperties();
        this.token = token || prop.getProperty('CHATWORK_API_TOKEN') || '';
    }
    send(roomId, msg) {
        const url = `https://api.chatwork.com/v2/rooms/${roomId}/messages`;
        const res = UrlFetchApp.fetch(url, {
            method: 'post',
            headers: {
                'X-ChatWorkToken': this.token,
            },
            payload: {
                body: msg,
            },
        });
        const txt = res.getContentText();
        console.log(txt);
        return txt;
    }
}
function chatWorkTest() {
    const roomId = 328904318;
    const cw = new ChatWork();
    cw.send(roomId, 'test');
}
