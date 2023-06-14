enum OpenAI35Role {
    SYSTEM = "system",
    ASSISTANT = "assistant",
    USER = "user",
}

enum OpenAIModels {
    GPT35TURBO = "gpt-3.5-turbo",
}

interface OpenAIMessage {
}


interface OpenAI35Message extends OpenAIMessage {
    role: OpenAI35Role,
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

