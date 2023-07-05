"use strict";
class FacebookReport {
    /**
     * コンストラクタ
     * @param token アクセストークン
     * @param node アカウントIDは接頭辞 "act_" を付ける。それ以外はそのまま
     */
    constructor(token, node) {
        this.endPoint = 'https://graph.facebook.com/v17.0/';
        this.token = token;
        this.node = node;
    }
    /**
     * 日付をフォーマット
     * @param date
     * @returns
     */
    static formatDate(date) {
        return Utilities.formatDate(date, 'JST', 'yyyy-MM-dd');
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
    makeGetUrl(url, fields, params) {
        const kvs = Object.entries(params);
        let qFields = `fields=${encodeURIComponent(fields.join(','))}`;
        const query = kvs.map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join('&');
        return `${url}?${qFields}&${query}`;
    }
    /**
     * ページング
     * @param url
     * @param options
     * @param onSuccess
     */
    paging(url, options, onSuccess) {
        const allResults = [];
        Logger.log(JSON.stringify({ url, options }, null, 2));
        const res = UrlFetchApp.fetch(url, options);
        let result = JSON.parse(res.getContentText());
        Logger.log(JSON.stringify(result, null, 2));
        if (onSuccess)
            onSuccess(result.data || []);
        allResults.push(...(result.data || []));
        while (result.paging && result.paging.next) {
            const nextUrl = result["paging"]["next"];
            Logger.log("nextUrl = " + nextUrl);
            result = JSON.parse(UrlFetchApp.fetch(nextUrl, options).getContentText());
            Logger.log(JSON.stringify(result, null, 2));
            if (onSuccess)
                onSuccess(result.data);
            allResults.push(...(result.data || []));
        }
        return allResults;
    }
    getWithPaging(edge, fields, params, onSuccess) {
        // オプション生成
        const options = this.makeOptions({ method: 'get' });
        const url = this.makeGetUrl(this.endPoint + this.node + edge, fields, params);
        return this.paging(url, options, onSuccess);
    }
    postWithPaging(edge, fields, payload = {}, onSuccess) {
        const options = this.makeOptions({ method: 'post', payload: JSON.stringify(payload) });
        const url = this.makeGetUrl(this.endPoint + this.node + edge, fields, {});
        return this.paging(url, options, onSuccess);
    }
    /**
     * レポート作成をリクエスト
     * @result レポートID
     */
    createInsights(fields, payload) {
        const options = this.makeOptions({ method: 'post', payload: JSON.stringify(payload) });
        const url = this.makeGetUrl(this.endPoint + this.node + "/insights", fields, {});
        Logger.log(JSON.stringify({ url, options }, null, 2));
        const res = UrlFetchApp.fetch(url, options);
        if (res.getResponseCode() != 200) {
            Logger.log("広告レポートを取得できませんでした。\n" + res.getContentText());
            return "";
        }
        const { report_run_id } = JSON.parse(res.getContentText());
        Logger.log("report_run_id = " + report_run_id);
        return report_run_id;
    }
    /**
     * レポート生成が完了したかどうかを取得
     */
    isCreateInsightsCompleted(report_run_id) {
        // 取得出来ない場合はtrueを返す
        if (!report_run_id)
            return true;
        const options = this.makeOptions();
        const url = this.endPoint + report_run_id;
        const response = UrlFetchApp.fetch(url, options);
        const json = JSON.parse(response.getContentText());
        Logger.log(json);
        // エラー時はtrueを返す
        if (json.error)
            return true;
        return json["async_percent_completion"] === 100 && json["async_status"] === "Job Completed";
    }
    /**
     * レポートを取得
     */
    getInsights(fields, payload, onSuccess) {
        const report_run_id = this.createInsights(fields, payload);
        // 広告APIの取得結果は非同期なため進行状況を定期的に確認する
        // レポートジョブ未完了の場合は、3秒スリープし、再度進行状況を確認する
        while (!this.isCreateInsightsCompleted(report_run_id)) {
            Utilities.sleep(3 * 1000);
        }
        const options = this.makeOptions();
        const url = this.endPoint + report_run_id + "/insights";
        return this.paging(url, options, onSuccess);
    }
    /**
     * バッチで取得
     */
    _getBatch(nodes, edge, fields, params) {
        // バッチ生成
        const batch = nodes.map(node => {
            const url = this.makeGetUrl('v17.0/' + node + edge, fields, params);
            return { method: "GET", relative_url: url };
        });
        // オプション
        const options = this.makeOptions({
            method: 'post', payload: {
                batch: JSON.stringify(batch),
            }
        });
        Logger.log(JSON.stringify(options, null, 2));
        // リクエスト
        const url = 'https://graph.facebook.com';
        const res = UrlFetchApp.fetch(url, options);
        // Logger.log(JSON.stringify(res.getAllHeaders(), null, 2));
        const resTxt = res.getContentText();
        Logger.log(resTxt);
        const data = JSON.parse(resTxt);
        const list = data; //data.data || data;
        return list.map((d) => {
            if (d.code != 200) {
                Logger.log(JSON.stringify(d, null, 2));
                return {};
            }
            const body = JSON.parse(d.body);
            Logger.log(JSON.stringify(body, null, 2));
            return body || {};
        }).flat();
    }
    /**
     * バッチで取得
     */
    getBatch(nodes, edge, fields, params, onSuccess) {
        const copiedNodes = [...nodes];
        const result = [];
        while (copiedNodes.length > 0) {
            const chunk = copiedNodes.splice(0, 50);
            const data = this._getBatch(chunk, edge, fields, params);
            result.push(...data);
            if (onSuccess)
                onSuccess(data);
        }
        return result;
    }
}
