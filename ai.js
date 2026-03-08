// Netlify Serverless Function — Gemini AI Proxy
// Your API key is stored as GEMINI_API_KEY in Netlify environment variables.
// It never appears in your app code or GitHub.

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'API key not configured. Add GEMINI_API_KEY to Netlify environment variables.' }),
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { type, message, tutorStyle, tutorName, subject, notes, grades, chatHistory, imageBase64 } = body;

    // Build the system prompt based on request type
    let systemPrompt = '';
    let userPrompt = '';
    let userParts = []; // Use an array for user parts to support text and inlineData

    if (type === 'chat') {
        if (!message && !imageBase64) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing message or imageBase64 for chat type' }) };
        }

        const styleGuide = {
            encouraging: 'You are warm, enthusiastic, and motivating. Use emojis occasionally. Celebrate effort.',
            strict: 'You are precise, structured, and direct. Focus on efficiency and clear explanations.',
            friendly: 'You are fun, relatable, and casual. Learning should feel like talking to a smart friend.',
            analytical: 'You are data-driven and methodical. Reference patterns and give structured step-by-step breakdowns.',
        };

        systemPrompt = `You are ${tutorName || 'Sophia'}, an elite AI study tutor for high school students.
${styleGuide[tutorStyle] || styleGuide.encouraging}
        Rules:
        - Give real, accurate, educational answers — not generic advice
        - Keep responses concise (2-4 sentences for simple questions, more for complex ones)
        - If asked a math/science question, show the working steps
        - If asked about literature, give specific analysis
        - Always be helpful and educational
        - You help with: math, science, english, history, french, and all high school subjects`;

        userPrompt = message;

    } else if (type === 'analyze') {
        systemPrompt = `You are an expert academic coach analyzing a student's weak areas. 
Respond ONLY with valid JSON in this exact format:
        {
            "topic": "subject and specific topic",
                "weakness": "specific weakness description in 1-2 sentences",
                    "strategies": ["strategy 1", "strategy 2", "strategy 3"],
                        "practiceQuestions": ["question 1", "question 2", "question 3", "question 4", "question 5"],
                            "explanation": "brief concept explanation in 2-3 sentences"
        } `;

        const gradeContext = grades ? `Student's grade data: ${JSON.stringify(grades)}` : '';
        userPrompt = `Analyze this student's academic weakness and provide targeted help.
Subject/Problem: "${subject}"
${gradeContext}
Provide specific, actionable strategies and real practice questions appropriate for high school level.`;

    } else if (type === 'flashcards') {
        systemPrompt = `You are an expert educator creating flashcard question-answer pairs from student notes.
Respond ONLY with valid JSON array in this exact format:
[
  {"question": "question text", "answer": "answer text"},
  {"question": "question text", "answer": "answer text"}
]
Create 5-8 high quality flashcards. Questions should test key concepts, definitions, and applications.`;

        userPrompt = `Create flashcards from these notes:
"${notes}"
Make the questions specific and educational. Answers should be clear and concise.`;

    } else if (type === 'quickstudy') {
        systemPrompt = `You are a study coach creating a quick review for a student.
Respond ONLY with valid JSON in this exact format:
{
  "title": "Quick [Subject] Review",
  "points": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"],
  "tips": ["study tip 1", "study tip 2", "study tip 3"]
}
Points should be key facts, formulas, or concepts. Use emojis to make them memorable.`;

        userPrompt = `Create a quick ${body.minutes}-minute study review for: ${subject}`;

    } else {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid type. Use: chat, analyze, flashcards, quickstudy' }) };
    }

    try {
        const geminiRequestBody = {
            contents: [],
            generationConfig: {
                temperature: type === 'chat' ? 0.8 : 0.4,
                maxOutputTokens: type === 'chat' ? 512 : 1024,
            },
        };

        // Add system instruction if supported by the model version
        geminiRequestBody.system_instruction = {
            parts: [{ text: systemPrompt }]
        };

        if (type === 'chat') {
            // Map chat history to Gemini format (user -> user, assistant -> model)
            if (chatHistory && Array.isArray(chatHistory)) {
                chatHistory.forEach(msg => {
                    // Skip if it looks like an image placeholder or empty
                    if (!msg.content) return;

                    const role = msg.role === 'assistant' ? 'model' : 'user';
                    // Strip the "📷 [Image Sent]" placeholder from history text
                    const content = msg.content.replace(/📷 \[Image Sent\]\n?/g, '');

                    if (content.trim()) {
                        geminiRequestBody.contents.push({
                            role: role,
                            parts: [{ text: content }]
                        });
                    }
                });
            }

            // Current user message / image
            const currentParts = [];
            if (imageBase64) {
                currentParts.push({
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: imageBase64
                    }
                });
            }
            if (userPrompt) {
                currentParts.push({ text: userPrompt });
            }

            // If the last message in history was 'user', we shouldn't add another 'user' block immediately if we want a valid exchange
            // But usually, we just append the latest 'user' prompt.
            geminiRequestBody.contents.push({
                role: 'user',
                parts: currentParts
            });

        } else {
            // For non-chat types (analyze, flashcards, etc.), keep it simple
            geminiRequestBody.contents = [
                { role: 'user', parts: [{ text: userPrompt }] }
            ];
        }

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiRequestBody),
            }
        );

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error('Gemini API error:', errText);
            return { statusCode: 502, headers, body: JSON.stringify({ error: 'AI service error. Check your API key.' }) };
        }

        const data = await geminiRes.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return { statusCode: 502, headers, body: JSON.stringify({ error: 'Empty response from AI' }) };
        }

        // For JSON response types, parse and re-validate
        if (type !== 'chat') {
            try {
                // Strip markdown code fences if present
                const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const parsed = JSON.parse(cleaned);
                return { statusCode: 200, headers, body: JSON.stringify({ result: parsed }) };
            } catch {
                // Return raw text if JSON parse fails
                return { statusCode: 200, headers, body: JSON.stringify({ result: text }) };
            }
        }

        return { statusCode: 200, headers, body: JSON.stringify({ result: text }) };

    } catch (err) {
        console.error('Function error:', err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
    }
};
