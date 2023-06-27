
class OpenAI {
    apiKey: string;
    model: string;
    maxTokens: number; // max token of answer. question and answer takes 4097 tokens at most.
    temperature: number; // 0.0 ~ 1.0
    memory: OpenAIMemory;
    stickeyMessage?: OpenAIMessage;
    limitter: OpenAILimitter;
    limitterMessage: string;

    // constructor
    constructor(params: {
        model: string,
        maxTokens: number,
        temperature: number,
        apiKey?: string,
        memoryMax?: number,
        memoryCacheKey?: string,
        stickyMessage?: OpenAIMessage,
        limitter?: OpenAILimitter,
        limitterMessage?: string,
    }) {
        this.apiKey = params.apiKey || PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY') || '';
        this.model = params.model;
        this.maxTokens = params.maxTokens;
        this.temperature = params.temperature;
        this.memory = new OpenAIMemory(params.memoryMax || 0, 60 * 10, params.memoryCacheKey);
        this.stickeyMessage = params.stickyMessage;
        this.limitter = params.limitter || OpenAILimitter.NoLimitter;
        this.limitterMessage = params.limitterMessage || 'Limit reached. Please wait a while and try again.';
    }

    // chat
    chat35(messages: OpenAI35Message[], options: { trim?: boolean } = {}): OpenAI35Response {
        const url = "https://api.openai.com/v1/chat/completions";

        // limit check
        if (this.limitter.isLimit()) {
            throw new Error(this.limitterMessage);
        }

        // generate message
        const newMessages = [...this.memory.get(), ...messages];
        if (this.stickeyMessage) {
            newMessages.unshift(this.stickeyMessage);
        }

        // request
        const payload = {
            model: this.model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            messages: newMessages,
        };
        Logger.log(JSON.stringify(payload, null, 2));

        const fetchOptions = {
            contentType: "application/json",
            headers: { Authorization: "Bearer " + this.apiKey },
            payload: JSON.stringify(payload),
        };

        // response
        const txt = UrlFetchApp.fetch(url, fetchOptions).getContentText();
        const result: OpenAI35Response = JSON.parse(txt);
        Logger.log(JSON.stringify(result, null, 2));

        // add memory
        messages.forEach(m => this.memory.add(m));

        // trim
        if (options.trim && result.choices[0].finish_reason == 'length') {
            result.choices[0].message.content = result.choices[0].message.content.replace(/[^,.、。\s]+$/, '');
        }
        
        // memory
        this.memory.add(result.choices[0].message);

        // add limitter
        this.limitter.addToken(result.usage.total_tokens);

        return result;
    }
}


function OpenAITest() {
    const test = new OpenAI({
        model: OpenAIModels.GPT35TURBO,
        maxTokens: 2000,
        temperature: 0.7,
        limitter: new OpenAILimitter({
            cacheKey: 'openai-limitter-test',
            limitTokens: 100,
            limitSeconds: 60,

        }),
    });
    const messages: OpenAI35Message[] = [
        { role: OpenAI35Role.SYSTEM, content: "You are a friend of user" },
        { role: OpenAI35Role.USER, content: "hello" },
    ];
    const result = test.chat35(messages);
    console.log(result);
}