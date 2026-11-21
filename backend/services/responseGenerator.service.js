import { GoogleGenAI } from "@google/genai";

const DEFAULT_CHAT_MODEL = `gemini-3.5-flash-lite`;

let client;

const getAI = () =>
    (client ??= new GoogleGenAI({
        apiKey: process.env.GEMINI_AI,
    }));

function formatHistory(history = []){
    return history
        .filter(
            (message) =>
                message.role === "user" ||
                message.role === "assistant"
        )
        .map((message) => ({
            role:
                message.role === "assistant"
                    ? "model"
                    : "user",
                parts: [
                    {
                        text: message.content,
                    },
                ],
        }));
}

function formatRetrievedContext(chunks = []){
    if (!chunks.length){
        return `
        NO RELEVANT COURSE MATERIAL WAS RETRIEVED.
        
        You may answer using general knowledge when appropriate,
        but do not pretend the answer came from the student's material.
        `;
    }

    return chunks
        .map(
            (chunk, index) => `
            SOURCE ${index + 1}
            
            Material ID: ${chunk.materialId}
            Chunk ID: ${chunk._id}
            Relevance Score: ${chunk.score}
            
            CONTENT:
            ${chunk.text}
            `
                )
                .join("\n\n");
}

function buildResponseInstructions({
    question,
    context,
    cognitiveinstructions,
}) {
    return `
    ${cognitiveinstructions}
    
    RETRIEVED COURSE MATERIAL:
    
    ${context}
    
    CURRENT STUDENT QUESTION:
    
    ${question}
    
    RESPONSE FORMAT:
    
    You MUST return valid JSON.
    
    Your response must follow this structure:
    
    {
        "mode": "DIRECT | GUIDED | SCAFFOLDED | COLLABORATIVE | CHALLENGE",
        "intent": "CONCEPTUAL | PROBLEM_SOLVING | ACADEMIC_WRITING | ASSIGNMENT | REVIEW | PRACTICE | GENERAL",
        "segments": [
            {
                "type": "grounded | explanation | question | hint | example | feedback",
                "text": "The actual response text",
                "sources": [1, 2]
            }
        ]
    }
    
    RULES FOR SEGMENTS:

    1. GROUNDED:
    Use type "grounded" for statements directly supported by retrieved course material.

    The sources array must contain the relevant source numbers.

    For example:

    {
        "type": "grounded",
        "text": "A process is a program currently in execution.",
        "sources": [1]
    }

    2. EXPLANATION:

    Use type "explanation" for:
    - General knowledge
    - Supplemental explanation
    - Analogies
    - Reasoning
    - Information not directly supported by retrieved material

    Sources should be an empty array.

    3. QUESTION:
    Use type "question" for questions intended to stimulate the student's thinking or guide their reasoning.

    4. HINT:
    Use type "hint" for hints and scaffoldings.

    5. EXAMPLE:
    Use type "example" for illustrative examples.

    6. FEEDBACK:
    Use type "feedback" for feedback on the student's reasoning, attempt answer or ideas.

    GROUNDING RULES:
    - Do not invent citations.
    - Only cite the retrieved source numbers.
    - Do not cite a source unless it directly supports the statement.
    - A segment may cite multiple sources.
    - If a statement is only partially supported by a source, separate the grounded and supplementary portions into different segments.
    - Never use source numbers outside the available sources.

    PEDAGOGICAL RULES:
    - Do not unnecessarily announce where information came from.
    - Do not say "According to your slides" repeatedly.
    - Do not say "This is not from your slides" unles clarification is genuinely necessary.
    - Let the frontend visually indicate grounded information.

    COGNITIVE RULES:
    - Do not complete substantial academic work that is intended to demonstrate the student's own intellectual contribution.
    - Scaffold instead.
    - When appropriate, ask one meaningful question rather than several overwhelming questions.
    - Do not turn every response into a quiz.
    - Answer conceptual questions naturally.
    - Be helpful and avoid unnecessary refusals.

    OUTPUT RULES:
    - Return JSON only.
    - No Markdown fences.
    - No text before or after the JSON.
    - Each segment should contain a reasonably coherent piece of text.
    - Do not create unnecessarily tiny segment.
    `;
}

function parseResponse(rawText){
    try {
        return JSON.parse(rawText);
    } catch {
        const start = rawText.indexOf("{");
        const end = rawText.lastIndexOf("}");

        if (start !== -1 && end !== -1 && end > start){
            return JSON.parse(rawText.slice(start, end + 1));
        }

        throw new Error("Invalid AI response format");
    }
}

function normalizeResponse(data){
    const validTypes = new Set([
        "grounded",
        "explanation",
        "question",
        "hint",
        "example",
        "feedback",
    ]);

    const segments = Array.isArray(data.segments)
        ? data.segments
        : [];

    const normalizedSegments = segments
        .filter((segment) => segment?.text)
        .map((segment) => ({
            type: validTypes.has(segment.type)
            ? segment.type
            : "explanation",
        
        text: String(segment.text),
        
        sources: Array.isArray(segment.sources)
            ? segment.sources
            : [],
        }));

    return {
        mode: data.mode || "DIRECT",
        intent: data.intent || "GENERAL",
        segments: normalizedSegments,

        answer: normalizedSegments
            .map((segment) => segment.text)
            .join("\n\n"),
    };
}

export async function generateResponse({
    question,
    history = [],
    contextChunks = [],
    cognitiveinstructions,
}) {
    const context = formatRetrievedContext(contextChunks);

    const instructions = buildResponseInstructions({
        question,
        context,
        cognitiveinstructions,
    });

    const contents = [
        ...formatHistory(history),
        {
            role: "user",
            parts: [
                {
                    text: instructions,
                },
            ],
        },
    ];

    const response = await getAI().models.generatContent({
        model:
            process.env.GEMINI_CHAT_MODEL || DEFAULT_CHAT_MODEL,

        contents,
        config: {
            temperature: 0.4,
            responseMimeType: "application/json",
        },
    });

    const rawText = response.text;

    if (!rawText) {
        throw new Error("AI returned an empty response");
    }

    const parsed = parseResponse(rawText);

    return normalizeResponse(parsed);
}