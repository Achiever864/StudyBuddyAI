
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import Chunk from "../models/chunk.model.js";

import {
    classifyRequest,
    buildContextInstructions,
} from "./contextEngine.service.js";

import { generateResponse } from "./responseGenerator.service.js";


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_AI,
});

const EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_CHAT_MODEL = "gemini-3.5-flash-lite";

const EMBEDDING_DIMENSIONS = 768;

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

const TOP_K = 5;
const MIN_SCORE = 0.7;

const EMBEDDING_BATCH_SIZE = 50;


function chunkText(text) {
    if (!text || typeof text !== "string") {
        return [];
    }

    const cleanedText = text.trim();

    if (!cleanedText) {
        return [];
    }

    const chunks = [];

    let start = 0;

    while (start < cleanedText.length) {
        const end = Math.min(
            start + CHUNK_SIZE,
            cleanedText.length
        );

        const chunk = cleanedText.slice(start, end).trim();

        if (chunk) {
            chunks.push(chunk);
        }

        if (end === cleanedText.length) {
            break;
        }

        start += CHUNK_SIZE - CHUNK_OVERLAP;
    }

    return chunks;
}


async function embedMany(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
        return [];
    }

    const embeddings = [];

    for (
        let i = 0;
        i < texts.length;
        i += EMBEDDING_BATCH_SIZE
    ) {
        const batch = texts.slice(
            i,
            i + EMBEDDING_BATCH_SIZE
        );

        const response = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: batch,
            config: {
                outputDimensionality: EMBEDDING_DIMENSIONS,
            },
        });

        const batchEmbeddings = response.embeddings ?? [];

        embeddings.push(
            ...batchEmbeddings.map((embedding) => embedding.values)
        );
    }

    return embeddings;
}

async function embedQuery(text) {
    if (!text || typeof text !== "string") {
        throw new Error("Query text is required for embedding.");
    }

    const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: {
            outputDimensionality: EMBEDDING_DIMENSIONS,
        },
    });

    return response.embeddings?.[0]?.values;
}

export async function ingestMaterial({
    materialId,
    userId,
    text,
}) {
    if (!materialId || !userId) {
        throw new Error(
            "materialId and userId are required for ingestion."
        );
    }

    if (!text || typeof text !== "string") {
        throw new Error("Material text is required.");
    }

    const chunks = chunkText(text);

    if (chunks.length === 0) {
        return {
            success: true,
            chunksCreated: 0,
        };
    }

    const embeddings = await embedMany(chunks);

    if (embeddings.length !== chunks.length) {
        throw new Error(
            "Embedding generation failed for one or more chunks."
        );
    }

    const chunkDocuments = chunks.map((chunk, index) => ({
        materialId,
        userId,
        content: chunk,
        index,
        embedding: embeddings[index],
    }));

    await Chunk.insertMany(chunkDocuments);

    return {
        success: true,
        chunksCreated: chunks.length,
    };
}

export async function retrieve({
    question,
    userId,
    materialId,
}) {
    if (!question || !userId) {
        return [];
    }

    const queryEmbedding = await embedQuery(question);

    if (!queryEmbedding) {
        return [];
    }

    const filter = {
        userId: new mongoose.Types.ObjectId(userId),
    };

    if (materialId) {
        filter.materialId =
            new mongoose.Types.ObjectId(materialId);
    }

    const results = await Chunk.aggregate([
        {
            $vectorSearch: {
                index: "chunk_vector_index",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: TOP_K * 20,
                limit: TOP_K,
                filter,
            },
        },
        {
            $project: {
                content: 1,
                materialId: 1,
                index: 1,
                score: {
                    $meta: "vectorSearchScore",
                },
            },
        },
    ]);

    return results.filter(
        (chunk) => chunk.score >= MIN_SCORE
    );
}

function cleanHistory(history = [], question) {
    if (!Array.isArray(history)) {
        return [];
    }

    const filtered = history.filter(
        (message) =>
            message &&
            (
                message.role === "user" ||
                message.role === "assistant"
            ) &&
            typeof message.content === "string"
    );

    const last = filtered[filtered.length - 1];

    if (
        last &&
        last.role === "user" &&
        last.content.trim() === question.trim()
    ) {
        filtered.pop();
    }

    return filtered;
}

function validateSegments(
    segments = [],
    contextChunks = []
) {
    if (!Array.isArray(segments)) {
        return [];
    }

    return segments
        .filter(
            (segment) =>
                segment &&
                typeof segment.text === "string" &&
                segment.text.trim().length > 0
        )
        .map((segment) => {
            const segmentSources = Array.isArray(
                segment.sources
            )
                ? segment.sources
                : [];

            const validSources = segmentSources.filter(
                (sourceIndex) =>
                    Number.isInteger(sourceIndex) &&
                    sourceIndex >= 1 &&
                    sourceIndex <= contextChunks.length
            );

            const normalizedSegment = {
                type: segment.type || "explanation",
                text: segment.text.trim(),
                sources: validSources,
            };

            if (
                normalizedSegment.type === "grounded" &&
                validSources.length === 0
            ) {
                normalizedSegment.type = "explanation";
            }

            return normalizedSegment;
        });
}


export async function answer({
    question,
    history = [],
    userId,
    materialId,
}) {
    if (!question || typeof question !== "string") {
        throw new Error("A valid question is required.");
    }

    if (!userId) {
        throw new Error("userId is required.");
    }

    const cleanedHistory = cleanHistory(
        history,
        question
    );

    const classification = classifyRequest(
        question,
        cleanedHistory
    );

    const contextChunks = await retrieve({
        question,
        userId,
        materialId,
    });

    const cognitiveInstructions =
        buildContextInstructions({
            classification,
            materialAvailable:
                contextChunks.length > 0,
        });

    const generated = await generateResponse({
        question,
        history: cleanedHistory,
        contextChunks,
        cognitiveInstructions,
    });

    const segments = validateSegments(
        generated?.segments,
        contextChunks
    );

    const answerText = segments
        .map((segment) => segment.text)
        .join("\n\n");


    const sources = contextChunks.map(
        (chunk, index) => ({
            sourceIndex: index + 1,
            materialId: chunk.materialId,
            chunkId: String(chunk._id),
            chunkIndex: chunk.index,
            score: chunk.score,
        })
    );

    return {
        answer: answerText,
        segments,
        mode: generated?.mode || classification.mode,
        intent: generated?.intent || classification.intent,
        sources,
    };
}
