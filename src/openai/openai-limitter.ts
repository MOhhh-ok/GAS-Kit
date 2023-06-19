/**
 * OpenAIのリクエスト制限のキャッシュデータ
 */
interface OpenAILimitterData {
    date: Date;
    tokens: number;
}

/**
 * OpenAIのリクエスト制限
 */
class OpenAILimitter {
    limitTokens: number;
    limitSeconds: number;
    cacheKey: string;
    cache: GoogleAppsScript.Cache.Cache;
    alwaysNoLimit: boolean = false;

    static NoLimitter = new OpenAILimitter({
        cacheKey: 'openai-limitter-no-limit',
        alwaysNoLimit: true,
    });

    constructor(params: {
        limitTokens?: number,
        limitSeconds?: number,
        cacheKey: string,
        alwaysNoLimit?: boolean,
    }) {
        this.limitTokens = params.limitTokens ? params.limitTokens : 100;
        this.limitSeconds = params.limitSeconds ? params.limitSeconds : 60;
        this.cacheKey = params.cacheKey;
        this.cache = CacheService.getUserCache();
        this.alwaysNoLimit = params.alwaysNoLimit ? params.alwaysNoLimit : false;
    }

    getCache(): OpenAILimitterData[] {
        const json = this.cache.get(this.cacheKey);
        if (!json)
            return [];

        const datas = JSON.parse(json);
        return datas.filter((data: OpenAILimitterData) => {
            const now = new Date();
            const diff = now.getTime() - new Date(data.date).getTime();
            return diff < this.limitSeconds * 1000;
        });
    }

    addToken(token: number) {
        const datas: OpenAILimitterData[] = [...this.getCache(), {
            date: new Date(),
            tokens: token,
        }];
        this.cache.put(this.cacheKey, JSON.stringify(datas), this.limitSeconds);
    }

    isLimit(): boolean {
        if (this.alwaysNoLimit)
            return false;
        const datas = this.getCache();
        const sum = datas.reduce((sum: number, data: OpenAILimitterData) => {
            return sum + data.tokens;
        }, 0);
        return sum > this.limitTokens;
    }
}


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