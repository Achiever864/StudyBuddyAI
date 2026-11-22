
import { GoogleGenAI } from "@google/genai";

const DEFAULT_CHAT_MODEL = "gemini-3.5-flash-lite";

let client;

const getAI = () => {
    if (!client) {
        client = new GoogleGenAI({
            apiKey: process.env.GEMINI_AI,
        });
    }

    return client;
};

const VALID_MODES = new Set([
    "DIRECT",
    "GUIDED",
    "SCAFFOLDED",
    "COLLABORATIVE",
    "CHALLENGE",
]);

const VALID_INTENTS = new Set([
    "CONCEPTUAL",
    "PROBLEM_SOLVING",
    "ACADEMIC_WRITING",
    "ASSIGNMENT",
    "REVIEW",
    "PRACTICE",
    "GENERAL",
]);

const VALID_SEGMENT_TYPES = new Set([
    "grounded",
    "explanation",
    "question",
    "hint",
    "example",
    "feedback",
]);


function formatHistory(history = []) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .filter(
            (message) =>
                message &&
                typeof message.content === "string" &&
                (
                    message.role === "user" ||
                    message.role === "assistant"
                )
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

function formatRetrievedContext(chunks = []) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        return `
NO RELEVANT COURSE MATERIAL WAS RETRIEVED.

You may answer using general knowledge when appropriate.

Do not pretend that your answer came from the student's
course material.

Any general knowledge or supplemental information must be
classified as an "explanation" segment.
`;
    }

    return chunks
        .map(
            (chunk, index) => `
SOURCE ${index + 1}

Material ID: ${chunk.materialId ?? "Unknown"}
Chunk ID: ${chunk._id ?? "Unknown"}
Chunk Index: ${chunk.index ?? "Unknown"}
Relevance Score: ${chunk.score ?? "Unknown"}

CONTENT:

${chunk.content ?? ""}
`
        )
        .join("\n\n");
}

function buildResponseInstructions({
    question,
    context,
    cognitiveInstructions,
}) {
    return `
${cognitiveInstructions}


==================================================
RETRIEVED COURSE MATERIAL
==================================================

${context}


==================================================
CURRENT STUDENT QUESTION
==================================================

${question}


==================================================
RESPONSE FORMAT
==================================================

You MUST return valid JSON.

Your response must follow this structure:

{
    "mode": "DIRECT",
    "intent": "CONCEPTUAL",
    "segments": [
        {
            "type": "grounded",
            "text": "The actual response text",
            "sources": [1]
        }
    ]
}


==================================================
SEGMENT TYPES
==================================================

1. GROUNDED

Use "grounded" for statements directly supported by
retrieved course material.

The sources array must contain the relevant source numbers.

Example:

{
    "type": "grounded",
    "text": "A process is a program currently in execution.",
    "sources": [1]
}


2. EXPLANATION

Use "explanation" for:

- General knowledge
- Supplemental explanation
- Analogies
- Reasoning
- Information not directly supported by retrieved material
- Additional examples not contained in the material

Sources should be an empty array.

Example:

{
    "type": "explanation",
    "text": "You can think of a process as an active instance of a program.",
    "sources": []
}


3. QUESTION

Use "question" for questions intended to stimulate the
student's thinking or guide their reasoning.


4. HINT

Use "hint" for hints, clues, and scaffolding.


5. EXAMPLE

Use "example" for illustrative examples.


6. FEEDBACK

Use "feedback" for feedback on the student's reasoning,
attempt, answer, draft, or ideas.


==================================================
GROUNDING RULES
==================================================

- Do not invent citations.
- Only cite retrieved source numbers.
- Source numbering begins at 1.
- Do not cite a source unless it directly supports the statement.
- A segment may cite multiple sources.
- If a statement is only partially supported by a source,
  separate the grounded and supplementary portions.
- Never use source numbers outside the available sources.
- When no relevant material is available, do not create
  grounded segments.
- A grounded segment must contain at least one source number.
- An explanation segment must not contain source citations.


==================================================
PEDAGOGICAL RULES
==================================================

- Do not unnecessarily announce where information came from.
- Do not repeatedly say "According to your slides".
- Do not repeatedly say "This is not in your slides".
- Let the frontend visually communicate grounding.
- Do not complete substantial academic work that is intended
  to demonstrate the student's own intellectual contribution.
- Scaffold instead.
- When appropriate, ask one meaningful question rather than
  several overwhelming questions.
- Do not turn every response into a quiz.
- Answer conceptual questions naturally.
- Be helpful and avoid unnecessary refusals.
- Adapt the assistance level to the student's actual request.


==================================================
OUTPUT RULES
==================================================

- Return JSON only.
- No Markdown fences.
- No text before or after the JSON.
- Each segment should contain a reasonably coherent piece
  of text.
- Do not create unnecessarily tiny segments.
- All segments must contain a non-empty text field.
- Every segment must contain a sources array.
- Use only the allowed segment types.
- Use only the allowed modes and intents.
`;
}

function parseResponse(rawText) {
    if (!rawText || typeof rawText !== "string") {
        throw new Error("AI returned an invalid response.");
    }

    try {
        return JSON.parse(rawText);
    } catch {
        const start = rawText.indexOf("{");
        const end = rawText.lastIndexOf("}");

        if (
            start !== -1 &&
            end !== -1 &&
            end > start
        ) {
            try {
                return JSON.parse(
                    rawText.slice(start, end + 1)
                );
            } catch {
                throw new Error(
                    "AI returned malformed JSON."
                );
            }
        }

        throw new Error(
            "AI response did not contain valid JSON."
        );
    }
}


function normalizeResponse(data) {
    if (!data || typeof data !== "object") {
        throw new Error(
            "AI returned an invalid structured response."
        );
    }

    const mode = VALID_MODES.has(data.mode)
        ? data.mode
        : "DIRECT";

    const intent = VALID_INTENTS.has(data.intent)
        ? data.intent
        : "GENERAL";

    const segments = Array.isArray(data.segments)
        ? data.segments
        : [];

    const normalizedSegments = segments
        .filter(
            (segment) =>
                segment &&
                typeof segment.text === "string" &&
                segment.text.trim().length > 0
        )
        .map((segment) => {
            const type = VALID_SEGMENT_TYPES.has(
                segment.type
            )
                ? segment.type
                : "explanation";

            const sources = Array.isArray(segment.sources)
                ? segment.sources.filter(
                      (source) =>
                          Number.isInteger(source) &&
                          source >= 1
                  )
                : [];

            return {
                type,
                text: segment.text.trim(),
                sources,
            };
        });

    return {
        mode,
        intent,
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
    cognitiveInstructions,
}) {
    if (!question || typeof question !== "string") {
        throw new Error(
            "A valid question is required for response generation."
        );
    }

    const context = formatRetrievedContext(
        contextChunks
    );

    const instructions = buildResponseInstructions({
        question,
        context,
        cognitiveInstructions,
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

    const response = await getAI().models.generateContent({
        model:
            process.env.GEMINI_CHAT_MODEL ||
            DEFAULT_CHAT_MODEL,

        contents,

        config: {
            temperature: 0.4,
            responseMimeType: "application/json",
        },
    });

    const rawText = response.text;

    if (!rawText) {
        throw new Error(
            "AI returned an empty response."
        );
    }

    const parsed = parseResponse(rawText);

    return normalizeResponse(parsed);
}