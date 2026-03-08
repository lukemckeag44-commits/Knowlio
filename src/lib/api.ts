// Real AI API client — calls our Netlify function which securely proxies to Gemini
// The API key is NEVER in this file or any client file.

const NETLIFY_URL = 'https://knowlio.netlify.app'; // Replace with your actual Netlify site URL
const AI_ENDPOINT = `${NETLIFY_URL}/.netlify/functions/ai`;

async function callAI(body: object): Promise<any> {
    const res = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `AI request failed: ${res.status}`);
    }

    const data = await res.json();
    return data.result;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export async function getAIChatResponse(
    message: string,
    tutorStyle: string,
    tutorName: string,
    chatHistory: { role: string; content: string }[] = [],
    imageBase64?: string
): Promise<string> {
    const result = await callAI({ type: 'chat', message, tutorStyle, tutorName, chatHistory, imageBase64 });
    return typeof result === 'string' ? result : 'Sorry, I could not generate a response. Please try again.';
}

// ─── Weakness Analysis ───────────────────────────────────────────────────────

export interface AIWeaknessAnalysis {
    topic: string;
    weakness: string;
    strategies: string[];
    practiceQuestions: string[];
    explanation: string;
}

export async function getAIWeaknessAnalysis(
    subject: string,
    grades?: any
): Promise<AIWeaknessAnalysis> {
    const result = await callAI({ type: 'analyze', subject, grades });

    // Validate shape
    if (result && result.topic && result.weakness && Array.isArray(result.strategies)) {
        return result as AIWeaknessAnalysis;
    }

    // Fallback if AI returns unexpected format
    return {
        topic: subject,
        weakness: 'Could not analyze at this time. Please try again.',
        strategies: ['Review your class notes', 'Practice problems daily', 'Ask your teacher for help'],
        practiceQuestions: ['What are the key concepts in this topic?', 'Can you solve a practice problem?'],
        explanation: result?.toString() || 'Please try again.',
    };
}

// ─── Flashcard Generation ────────────────────────────────────────────────────

export interface AIFlashcard {
    question: string;
    answer: string;
}

export async function getAIFlashcards(notes: string): Promise<AIFlashcard[]> {
    const result = await callAI({ type: 'flashcards', notes });

    if (Array.isArray(result)) {
        return result.filter((c: any) => c.question && c.answer);
    }

    return [];
}

// ─── Quick Study ─────────────────────────────────────────────────────────────

export interface AIQuickStudy {
    title: string;
    points: string[];
    tips: string[];
}

export async function getAIQuickStudy(subject: string, minutes: number): Promise<AIQuickStudy> {
    const result = await callAI({ type: 'quickstudy', subject, minutes });

    if (result && result.title && Array.isArray(result.points)) {
        return result as AIQuickStudy;
    }

    return {
        title: `Quick ${subject} Review`,
        points: ['Review your notes', 'Practice key concepts', 'Test yourself with questions'],
        tips: ['Focus on understanding, not memorising', 'Take short breaks', 'Teach it to someone else'],
    };
}
