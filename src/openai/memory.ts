class OpenAIMemory {
    cacheKey: string;
    cache: GoogleAppsScript.Cache.Cache;
    max: number;

    constructor(max: number, cacheKey?: string) {
        this.cacheKey = cacheKey ? cacheKey : 'openai-memory-user';
        this.cache = CacheService.getUserCache();
        this.max = max;
    }

    get(): OpenAIMessage[] {
        const json = this.cache.get(this.cacheKey);
        return json ? JSON.parse(json) : [];
    }

    set(messages: OpenAIMessage[]) {
        const sliced = messages.slice(messages.length - this.max);
        this.cache.put(this.cacheKey, JSON.stringify(sliced));
    }

    add(message: OpenAIMessage) {
        const messages = this.get();
        messages.push(message);
        this.set(messages);
    }
}