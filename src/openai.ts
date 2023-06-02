interface OpenAI35Message {
    role: string,
    content: string,
}

interface OpenAI35Response {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: {
        message: OpenAI35Message;
        finish_reason: string;
        index: number;
    }[];
}


class OpenAI {
    static MODELS = {
        GPT35TURBO: 'gpt-3.5-turbo',
    } as const;

    static ROLES = {
        SYSTEM: 'system',
        ASSISTANT: 'assistant',
        USER: 'user',
    } as const;

    secretKey: string;
    model: string;
    maxTokens: number; // max token of answer. question and answer takes 4097 tokens at most.
    temperature: number; // 0.0 ~ 1.0

    // constructor
    constructor(params: {
        model: string,
        maxTokens: number,
        temperature: number,
    }) {
        this.secretKey = PropertiesService.getScriptProperties().getProperty('OPENAI_SECRET_KEY') || '';
        this.model = params.model;
        this.maxTokens = params.maxTokens;
        this.temperature = params.temperature;
    }


    // chat
    chat35(messages: OpenAI35Message[]): OpenAI35Response {
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


function OpenAITest() {
    const test = new OpenAI({
        model: OpenAI.MODELS.GPT35TURBO,
        maxTokens: 2000,
        temperature: 0.7,
    });
    const messages: OpenAI35Message[] = [
        { role: OpenAI.ROLES.SYSTEM, content: "You are a friend of user" },
        { role: OpenAI.ROLES.USER, content: "hello" },
    ];
    const res = test.chat35(messages).choices[0].message.content;
    console.log(res);
}