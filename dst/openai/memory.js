"use strict";
class OpenAIMemory {
    constructor(max, expirationInSeconds = 60 * 60, cacheKey) {
        this.cacheKey = cacheKey ? cacheKey : 'openai-memory-user';
        this.cache = CacheService.getUserCache();
        this.max = max;
        this.expirationInSeconds = expirationInSeconds;
    }
    get() {
        const json = this.cache.get(this.cacheKey);
        return json ? JSON.parse(json) : [];
    }
    set(messages) {
        const sliced = messages.slice(messages.length - this.max);
        this.cache.put(this.cacheKey, JSON.stringify(sliced), this.expirationInSeconds);
    }
    add(message) {
        const messages = this.get();
        messages.push(message);
        this.set(messages);
    }
}
