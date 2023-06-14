class LINE {
    onWebhookEvent?: Function;

    constructor(args: { onWebhookEvent?: Function }) {
        if (args.onWebhookEvent) {
            this.onWebhookEvent = args.onWebhookEvent;
        }
    }

    send(args: { replyToken: string, text: string, }) {
        const prop = PropertiesService.getScriptProperties();

        const payload = {
            replyToken: args.replyToken,
            messages: [{
                type: 'text',
                text: args.text,
            }]
        };
        const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
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
    doPost(args: { postData: { contents: string } }) {
        const cache = CacheService.getScriptCache();
        const hookedData: LINEWebhookData = JSON.parse(args.postData.contents);

        for (let event of hookedData.events) {
            // Ignore duplicated event
            const cacheKey = 'LINEWebhookEventId:' + event.webhookEventId;
            if (cache.get(cacheKey)) {
                continue;
            }
            this.onWebhookEvent!(event);
            cache.put(cacheKey, '1', 60 * 10);
        }
    }
}
