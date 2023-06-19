"use strict";
/**
 * OpenAIのリクエスト制限
 */
class OpenAILimitter {
    constructor(params) {
        this.alwaysNoLimit = false;
        this.limitTokens = params.limitTokens ? params.limitTokens : 100;
        this.limitSeconds = params.limitSeconds ? params.limitSeconds : 60;
        this.cacheKey = params.cacheKey;
        this.cache = CacheService.getUserCache();
        this.alwaysNoLimit = params.alwaysNoLimit ? params.alwaysNoLimit : false;
    }
    getCache() {
        const json = this.cache.get(this.cacheKey);
        if (!json)
            return [];
        const datas = JSON.parse(json);
        return datas.filter((data) => {
            const now = new Date();
            const diff = now.getTime() - new Date(data.date).getTime();
            return diff < this.limitSeconds * 1000;
        });
    }
    addToken(token) {
        const datas = [...this.getCache(), {
                date: new Date(),
                tokens: token,
            }];
        this.cache.put(this.cacheKey, JSON.stringify(datas), this.limitSeconds);
    }
    isLimit() {
        if (this.alwaysNoLimit)
            return false;
        const datas = this.getCache();
        const sum = datas.reduce((sum, data) => {
            return sum + data.tokens;
        }, 0);
        return sum > this.limitTokens;
    }
}
OpenAILimitter.NoLimitter = new OpenAILimitter({
    cacheKey: 'openai-limitter-no-limit',
    alwaysNoLimit: true,
});
function openAILimitterTest() {
    const test = new OpenAILimitter({
        cacheKey: 'openai-limitter-test',
        limitTokens: 100,
        limitSeconds: 60,
    });
    console.log(test.isLimit());
    test.addToken(60);
    console.log(test.isLimit());
    test.addToken(60);
    console.log(test.isLimit());
}
