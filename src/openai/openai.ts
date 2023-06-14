
class OpenAI {
    secretKey: string;
    model: string;
    maxTokens: number; // max token of answer. question and answer takes 4097 tokens at most.
    temperature: number; // 0.0 ~ 1.0
    memory: OpenAIMemory;

    // constructor
    constructor(params: {
        model: string,
        maxTokens: number,
        temperature: number,
        memoryMax?: number,
    }) {
        this.secretKey = PropertiesService.getScriptProperties().getProperty('OPENAI_SECRET_KEY') || '';
        this.model = params.model;
        this.maxTokens = params.maxTokens;
        this.temperature = params.temperature;
        this.memory = new OpenAIMemory(params.memoryMax || 1);
    }

    joinMemory(messages: OpenAIMessage[]) {
        messages.forEach((message) => this.memory.add(message));
        return this.memory.get();
    }

    // chat
    chat35(messages: OpenAI35Message[]): OpenAI35Response {
        const url = "https://api.openai.com/v1/chat/completions";
        const payload = {
            model: this.model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            messages: this.joinMemory(messages),
        };
        console.info(JSON.stringify(payload, null, 2));

        const options = {
            contentType: "application/json",
            headers: { Authorization: "Bearer " + this.secretKey },
            payload: JSON.stringify(payload),
        };

        const txt = UrlFetchApp.fetch(url, options).getContentText();
        const result = JSON.parse(txt);
        console.info(JSON.stringify(result, null, 2));
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
    const res = test.chat35(messages).choices[0].message.content;
    console.log(res);
}