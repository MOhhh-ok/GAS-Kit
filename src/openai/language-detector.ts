/**
 * GPTで言語判定
 */
class OpenAILanguageDetector {
  ai: OpenAI;

  // constructor
  constructor() {
    this.ai = new OpenAI({
      model: OpenAIModels.GPT4,
      maxTokens: 100, // 回答最大トークン。マックス4097(質問と回答合わせて??)
      temperature: 0,
      memoryCacheKey: String(new Date().getTime()), // 通常の会話と区別するために日付をキーにする
      memoryMax: 0,
    });
  }

  detect(text: string) {
    const content = '以下の文章は何語ですか？ISO 639-1で答えてください。わからなければunknownと答えてください。\n\n'
      + '\n\n'
      + '=== インプット ===\n'
      + text.replace(/\n/g, '\\n')
      + '\n\n'
      + '=== アウトプット ===\n'
      + 'ISO 639-1: ';

    const message: OpenAI35Message = {
      role: OpenAI35Role.USER,
      content,
    };
    const ret = this.ai.chat35([message]);
    return ret.choices[0].message.content;
  }
}

function openAILanguegeDetectorTest() {
  const detector = new OpenAILanguageDetector();
  const lang = detector.detect('私は法人です');
  console.log(lang);
}
