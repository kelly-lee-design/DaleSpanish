// aiSentences format: [{ es: "Spanish sentence.", ko: "한국어 번역." }, ...]
// Legacy format (plain strings) is also supported in display components.

export async function generateSentences(word, meaning) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    return [
      { es: `Oye, ¿sabes cómo se usa "${word}"?`, ko: `야, "${meaning}"를 어떻게 쓰는지 알아?` },
      { es: `Necesito usar "${word}" más en mi vida diaria.`, ko: `일상에서 "${meaning}"를 더 자주 써야겠어.` },
    ]
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Spanish language tutor. Always respond with valid JSON only, no markdown.',
        },
        {
          role: 'user',
          content: `Create exactly 2 Spanish example sentences using the word "${word}" (Korean meaning: ${meaning}).

Requirements:
- Must be sentences people ACTUALLY say in real daily life (greetings, shopping, café, restaurant, travel, phone calls, small talk, etc.)
- Sound natural and colloquial — NOT textbook or formal
- Beginner to intermediate level vocabulary
- Each sentence should reflect a specific realistic situation (e.g. ordering food, asking directions, chatting with a friend)
- For each sentence also provide a Korean translation

Return ONLY a valid JSON array of exactly 2 objects with "es" and "ko" keys.
Example: [{"es": "¿Me pones un café con leche, por favor?", "ko": "카페라떼 한 잔 주시겠어요?"}, {"es": "Oye, ¿quedamos mañana para comer?", "ko": "야, 내일 점심 같이 먹을래?"}]`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content?.trim()
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

// Normalize legacy plain-string sentences to the new {es, ko} format for display
export function normalizeSentence(s) {
  if (typeof s === 'string') return { es: s, ko: null }
  return s
}
