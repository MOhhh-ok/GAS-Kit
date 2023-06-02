"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAI = void 0;
class OpenAI {
    // constructor
    constructor(params) {
        this.secretKey = PropertiesService.getScriptProperties().getProperty('OPENAI_SECRET_KEY') || '';
        this.model = params.model;
        this.maxTokens = params.maxTokens;
        this.temperature = params.temperature;
    }
    // chat
    chat35(messages) {
        const url = "https://api.openai.com/v1/chat/completions";
        const payload = {
            model: this.model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            messages: messages,
        };
        console.log(JSON.stringify(payload, null, 2));
        const options = {
            contentType: "application/json",
            headers: { Authorization: "Bearer " + this.secretKey },
            payload: JSON.stringify(payload),
        };
        const txt = UrlFetchApp.fetch(url, options).getContentText();
        const result = JSON.parse(txt);
        console.log(JSON.stringify(result, null, 2));
        return result;
    }
}
OpenAI.MODELS = {
    GPT35TURBO: 'gpt-3.5-turbo',
};
OpenAI.ROLES = {
    SYSTEM: 'system',
    ASSISTANT: 'assistant',
    USER: 'user',
};
exports.OpenAI = OpenAI;
function OpenAITest() {
    const test = new OpenAI({
        model: OpenAI.MODELS.GPT35TURBO,
        maxTokens: 2000,
        temperature: 0.7,
    });
    const messages = [
        { role: OpenAI.ROLES.SYSTEM, content: "You are a friend of user" },
        { role: OpenAI.ROLES.USER, content: "hello" },
    ];
    const res = test.chat35(messages).choices[0].message.content;
    console.log(res);
}
