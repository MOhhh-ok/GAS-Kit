enum OpenAI35Role {
    SYSTEM = "system",
    ASSISTANT = "assistant",
    USER = "user",
    FUNCTION = 'function',
}

enum OpenAIModels {
    GPT35TURBO = "gpt-3.5-turbo",
    GPT4 = "gpt-4",
}

interface OpenAIMessage {
}


interface OpenAI35Message extends OpenAIMessage {
    role: OpenAI35Role,
    content: string,
}

interface OpenAIFunction {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
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
        finish_reason: "stop" | "length" | "function_call" | "content_filter" | "null";
        index: number;
    }[];
}

