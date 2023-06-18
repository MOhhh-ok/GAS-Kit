class OpenAIMemory {
    cacheKey: string;
    cache: GoogleAppsScript.Cache.Cache;
    max: number;
    expirationInSeconds: number;

    constructor(max: number, expirationInSeconds: number = 60 * 60, cacheKey?: string) {
        this.cacheKey = cacheKey ? cacheKey : 'openai-memory-user';
        this.cache = CacheService.getUserCache();
        this.max = max;
        this.expirationInSeconds = expirationInSeconds;
    }

    get(): OpenAIMessage[] {
        const json = this.cache.get(this.cacheKey);
        return json ? JSON.parse(json) : [];
    }

    set(messages: OpenAIMessage[]) {
        const messages2 = [...messages];
        if (messages2.length > this.max) {
            messages2.splice(0, messages2.length - this.max);
        }

        this.cache.put(this.cacheKey, JSON.stringify(messages2), this.expirationInSeconds);
    }

    add(message: OpenAIMessage) {
        const messages = this.get();
        messages.push(message);
        this.set(messages);
    }
}

function OpenAIMemoryTest() {
    const memory = new OpenAIMemory(3);
    memory.add({
        role: OpenAI35Role.USER,
        content: 'こんにちは。今は' + new Date() + 'です。',
    });

    const res = memory.get();
    console.log(JSON.stringify(res, null, 2));

}