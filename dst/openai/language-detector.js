"use strict";
/**
 * GPTで言語判定
 */
class OpenAILanguageDetector {
    // constructor
    constructor() {
        this.ai = new OpenAI({
            model: OpenAIModels.GPT35TURBO,
            maxTokens: 100,
            temperature: 0,
            memoryCacheKey: String(new Date().getTime()),
            memoryMax: 0,
        });
    }
    detect(text) {
        const content = '以下の文章は何語ですか？ISO 639-1で答えてください。わからなければunknownと答えてください。\n\n'
            + '\n\n'
            + '=== インプット ===\n'
            + text.replace(/\n/g, '\\n')
            + '\n\n'
            + '=== アウトプット ===\n'
            + 'ISO 639-1: ';
        const message = {
            role: OpenAI35Role.USER,
            content,
        };
        const ret = this.ai.chat35([message]);
        return ret.choices[0].message.content;
    }
}
function openAILanguegeDetectorTest() {
    const detector = new OpenAILanguageDetector();
    const lang = detector.detect('吾輩は猫である');
    console.log(lang);
}
