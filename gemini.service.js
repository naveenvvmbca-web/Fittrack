async function askGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error("GEMINI_API_KEY is not configured"), { statusCode: 503 });

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || "Gemini request failed";
    throw Object.assign(new Error(message), { statusCode: 502 });
  }

  return data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "No AI response generated.";
}

module.exports = { askGemini };