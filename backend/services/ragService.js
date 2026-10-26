import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import Chunk from "../models/chunk.model.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_AI });

const EMBED_MODEL = "gemini-embedding-001";
const EMBED_DIMS = 768;
const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";
const VECTOR_INDEX = "chunk_vector_index";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const TOP_K = 5;
const MIN_SCORE = 0.3;
const EMBED_BATCH = 100;

const toId = (id) => new mongoose.Types.ObjectId(id);


export function chunkText (text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const clean = text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const chunks = [];
    let  start = 0;

    while (start < clean.length){
        let end = Math.min(start + size, clean.length);

        if (end < clean.length) {
            const boundary = Math.max(clean.lastIndexOf("\n\n", end), clean.lastIndexOf(".", end));
            if (boundary > start + size * 0.5) end = boundary + 1;
        }

        const piece = clean.slice(start, end).trim();
        if (piece) chunks.push(piece);

        if (end >= clean.length) break;
        start = Math.max(end - overlap, start + 1);
    }

    return chunks;
}

async function embedMany(texts, taskType) {
    const vectors = [];
    for (let i = 0; i < texts.length; i += EMBED_BATCH) {
        const res = await ai.models.embedContent({
            model: EMBED_MODEL,
            contents: text.slice(i, i + EMBED_BATCH),
            config: { taskType, outputDimensionality: EMBED_DIMS }
        });
        vectors.push(...res.embeddings.map((e) => e.values));
    }
    return vectors;
}

async function embedQuery(text){
    const [vector] = await embedMany([text], "RETRIEVAL_QUERY");
    return vector;
}

export async function ingestMaterial({ materialId, userId, text }) {
    const pieces = chunkText(text);
    if (pieces.length === 0) throw new Error("No readable text found in this material");

    const vectors = await embedMany(pieces, "RETRIEVAL_DOCUMENT");

    await Chunk.deleteMany({ materialId });

    await Chunk.insertMany(
        pieces.map((pice, 1) => ({
            materialId,
            userId,
            index: i,
            text: piece,
            embedding: vectors[i],
        }))
    );
    return { chunks: pieces.length };
}

async function retrieve({ question, userId, materialId }) {
    const queryVector = await embedQuery(question);

    const filter = { userId: toId(userId) };
    if (materialId) filter.materialId = toId(materialId);

    const results = await Chunk.aggregate([
        {
            $vectorSearch: {
                index: VECTOR_INDEX,
                path: "embedding",
                queryVector,
                numCandidates: 100,
                limit: TOP_K,
                filter,
            },
        },
        {
            $project: {
                text: 1,
                materialId: 1,
                index: 1,
                score: { $meta: "vectorSearchScore" },
            },
        },
    ]);

    return results.filter((r) => r.score >= MIN_SCORE);
}

function buildSystemPrompt(contextChunks){
    const context = contextChunks.length
        ? contextChunks.map((c, i) => `[${i+1}] ${c.text}`).join("\n\n")
        : "(no relevant excerpts found)";

    return [
        "You are StudyBuddy, a study assistant.",
        "Answer using the excerpts from the student's notes below.",
        "If the excerpts don't contain the answer, say so plainly then you may offer general help clearly labelled as not from their notes.",
        "Cite excerpts with their numbers like [1] when you use them.",
        "",
        "NOTES:",
        context,
    ].join("\n");
}

function toGeminiContents(history, question){
    const turns =  [...history.map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: m.text })),
        {role: "user", text: question },
    ];

    const merged = [];
    for (const t of turns){
        const prev = merged[merged.length - 1];
        if (prev && prev.role === t.role) prev.parts[0].text += `\n\n${t.text}`;
        else merged.push({ role: t.role, parts: [{ text: t.text}] });
    }

    while(merged.length && merged[0].role !== "user") merged.shift();
    return merged;
}


export async function answer({question, history = [], userId, materialId }) {
    const contextChunks = await retrieve({ question, userId, materialId });

    const prior = history.filter((m) => m.role === "user" || m.role === "assistant");
    const last = prior[prior.length - 1];
    if (last && last.role === "user" && last.text === question) prior.pop();

    const response = await ai.models.generateContent({
        model: CHAT_MODEL,
        contents: toGeminiContents(prior, question),
        config: {
            systemInstruction: buildSystemPrompt(contextChunks),
            temperature: 0.3,
        },
    });

    return {
        answer: response.text,
        sources: contextChunks.map((c) => ({
            materialId: c.materialId,
            chunkId: String(c._id),
            score: c.score,
        })),
    };
}