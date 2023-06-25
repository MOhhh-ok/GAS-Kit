"use strict";
class FacebookReport {
    /**
     * インスタンス生成。アクセストークンを指定
     */
    constructor(token, accountId) {
        this.endPoint = 'https://graph.facebook.com/v17.0/';
        this.token = token;
        this.accountId = accountId;
    }
    /**
     * オプションを生成
     */
    makeOptions(options = {}) {
        const defaultOptions = {
            "method": "get",
            "contentType": "application/json",
            "headers": { "Authorization": "Bearer " + this.token },
            "muteHttpExceptions": true,
        };
        return Object.assign(defaultOptions, options);
    }
    /**
     * GET URLを生成
     */
    makeGetUrl(url, params) {
        const kvs = Object.entries(params);
        const query = kvs.map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join('&');
        return `${url}?${query}`;
    }
    /**
     * ページング
     * @param url
     * @param options
     * @param onSuccess
     */
    paging(url, options, onSuccess) {
        Logger.log(JSON.stringify({ url, options }));
        const res = UrlFetchApp.fetch(url, options);
        let result = JSON.parse(res.getContentText());
        Logger.log(JSON.stringify(result, null, 2));
        onSuccess(result.data);
        while (result.paging && result.paging.next) {
            const nextUrl = result["paging"]["next"];
            Logger.log("nextUrl = " + nextUrl);
            result = JSON.parse(UrlFetchApp.fetch(nextUrl, options).getContentText());
            Logger.log(JSON.stringify(result, null, 2));
            onSuccess(result.data);
        }
    }
    /**
     * 日付をフォーマット
     * @param date
     * @returns
     */
    formatDate(date) {
        return Utilities.formatDate(date, 'JST', 'yyyy-MM-dd');
    }
    /**
     * キャンペーン情報を取得
     */
    getCampaigns(params, onSuccess) {
        const options = this.makeOptions();
        const url = this.makeGetUrl(this.endPoint + 'act_' + this.accountId + '/campaigns', params);
        this.paging(url, options, onSuccess);
    }
    /**
     * Adsetsを取得
     */
    getAdsets(params, onSuccess) {
        const options = this.makeOptions();
        const url = this.makeGetUrl(this.endPoint + this.accountId + '/adsets', params);
        this.paging(url, options, onSuccess);
    }
    /**
     * Adを取得
     */
    getAds(params, onSuccess) {
        const options = this.makeOptions();
        const url = this.makeGetUrl(this.endPoint + this.accountId + '/ads', params);
        this.paging(url, options, onSuccess);
    }
    /**
     * レポート作成をリクエスト
     * @result レポートID
     */
    _createInsights(payload) {
        const options = this.makeOptions({ method: 'post', payload });
        const res = UrlFetchApp.fetch(this.endPoint + "act_" + this.accountId + "/insights", options);
        if (res.getResponseCode() != 200) {
            Logger.log("広告レポートを取得できませんでした");
        }
        const { report_run_id } = JSON.parse(res.getContentText());
        Logger.log("report_run_id = " + report_run_id);
        return report_run_id;
    }
    /**
     * レポート生成が完了したかどうかを取得
     */
    _isCreateInsightsCompleted(report_run_id) {
        const options = this.makeOptions();
        const url = this.endPoint + report_run_id;
        const response = UrlFetchApp.fetch(url, options);
        const json = JSON.parse(response.getContentText());
        Logger.log("report status: ");
        Logger.log(json);
        return json["async_percent_completion"] === 100 && json["async_status"] === "Job Completed";
    }
    /**
     * レポートを取得
     */
    getInsights(payload, onSuccess) {
        const report_run_id = this._createInsights(payload);
        // 広告APIの取得結果は非同期なため進行状況を定期的に確認する
        // レポートジョブ未完了の場合は、10秒スリープし、再度進行状況を確認する
        while (!this._isCreateInsightsCompleted(report_run_id)) {
            Utilities.sleep(10 * 1000);
        }
        const options = this.makeOptions();
        const url = this.endPoint + report_run_id + "/insights";
        this.paging(url, options, onSuccess);
    }
}
