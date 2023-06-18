"use strict";
class LINE {
    constructor(args) {
        if (args.onWebhookEvent) {
            this.onWebhookEvent = args.onWebhookEvent;
        }
    }
    send(args) {
        const prop = PropertiesService.getScriptProperties();
        const payload = {
            replyToken: args.replyToken,
            messages: [{
                    type: 'text',
                    text: args.text,
                }]
        };
        const options = {
            payload: JSON.stringify(payload),
            method: 'post',
            headers: {
                Authorization: "Bearer " + prop.getProperty('LINE_CHANNEL_ACCESS'),
            },
            contentType: 'application/json'
        };
        UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', options);
    }
    /**
     * Place this on doPost
     */
    doPost(args) {
        const cache = CacheService.getScriptCache();
        const hookedData = JSON.parse(args.postData.contents);
        for (let event of hookedData.events) {
            // Ignore duplicated event
            const cacheKey = 'LINEWebhookEventId:' + event.webhookEventId;
            if (cache.get(cacheKey)) {
                continue;
            }
            this.onWebhookEvent(event);
            cache.put(cacheKey, '1', 60 * 10);
        }
    }
}
