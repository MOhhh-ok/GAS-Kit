
class OpenAI {
    secretKey: string;
    model: string;
    maxTokens: number; // max token of answer. question and answer takes 4097 tokens at most.
    temperature: number; // 0.0 ~ 1.0
    memory: OpenAIMemory;
    stickeyMessage?: OpenAIMessage;

    // constructor
    constructor(params: {
        model: string,
        maxTokens: number,
        temperature: number,
        memoryMax?: number,
        memoryCacheKey?: string,
        stickyMessage?: OpenAIMessage,
    }) {
        this.secretKey = PropertiesService.getScriptProperties().getProperty('OPENAI_SECRET_KEY') || '';
        this.model = params.model;
        this.maxTokens = params.maxTokens;
        this.temperature = params.temperature;
        this.memory = new OpenAIMemory(params.memoryMax || 1, 60 * 10, params.memoryCacheKey);
        this.stickeyMessage = params.stickyMessage;
    }

    addMemory(message: OpenAIMessage) {
        this.memory.add(message);
        return this.memory.get();
    }

    // chat
    chat35(message: OpenAI35Message): OpenAI35Response {
        const url = "https://api.openai.com/v1/chat/completions";

        const messages = this.addMemory(message);
        if (this.stickeyMessage) {
            messages.unshift(this.stickeyMessage);
        }

        const payload = {
            model: this.model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            messages,
        };
        console.info(JSON.stringify(payload, null, 2));

        const options = {
            contentType: "application/json",
            headers: { Authorization: "Bearer " + this.secretKey },
            payload: JSON.stringify(payload),
        };

        const txt = UrlFetchApp.fetch(url, options).getContentText();
        const result: OpenAI35Response = JSON.parse(txt);
        console.info(JSON.stringify(result, null, 2));
        this.addMemory(result.choices[0].message);
        return result;
    }
}


function OpenAITest() {
    const test = new OpenAI({
        model: OpenAIModels.GPT35TURBO,
        maxTokens: 2000,
        temperature: 0.7,
    });
    const messages: OpenAI35Message[] = [
        { role: OpenAI35Role.SYSTEM, content: "You are a friend of user" },
        { role: OpenAI35Role.USER, content: "hello" },
    ];
}