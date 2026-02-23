
interface TranslationResult {
    titulo?: string;
    descricao?: string;
    descricao_completa?: string;
    texto?: string; // Para depoimentos
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function translateContent(
    content: TranslationResult,
    targetLocale: string
): Promise<TranslationResult> {
    if (!content) return {};
    if (!OPENAI_API_KEY) {
        console.warn('VITE_OPENAI_API_KEY não definida. Retornando texto original com prefixo.');
        return mockTranslation(content, targetLocale);
    }

    const prompt = `Translate the following JSON object values to ${targetLocale}. Maintain the structure and keys. Only return the JSON.
  ${JSON.stringify(content)}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result;
    } catch (error) {
        console.error('Erro na tradução IA:', error);
        return mockTranslation(content, targetLocale);
    }
}

function mockTranslation(content: TranslationResult, locale: string): TranslationResult {
    const result: any = {};
    for (const key in content) {
        if (Object.prototype.hasOwnProperty.call(content, key)) {
            result[key] = `[${locale.toUpperCase()}] ${(content as any)[key]}`;
        }
    }
    return result;
}
