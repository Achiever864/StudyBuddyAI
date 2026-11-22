import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing.");
    }

    return new GoogleGenAI({ apiKey });
};


const SUPPORTED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
    "text/plain": "txt",
    "image/jpeg": "image",
    "image/png": "image",
    "image/webp": "image",
};

const cleanText = (text) => {
    return text
        .replace(/\r/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
};


const extractPDF = async (buffer) => {
    const result = await pdfParse(buffer);

    const text = cleanText(result.text || "");

    if (!text) {
        throw new Error(
            "This PDF contains no extractable text. It may be a scanned document."
        );
    }

    return text;
};

const extractDOCX = async (buffer) => {
    const result = await mammoth.extractRawText({
        buffer,
    });

    const text = cleanText(result.value || "");

    if (!text) {
        throw new Error("Could not extract text from this Word document.");
    }

    return text;
};

const extractTXT = (buffer) => {
    const text = cleanText(buffer.toString("utf-8"));

    if (!text) {
        throw new Error("The uploaded text file is empty.");
    }

    return text;
};

const extractImageContent = async (file) => {
    const ai = getAI();

    const base64Image = file.buffer.toString("base64");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            mimeType: file.mimetype,
                            data: base64Image,
                        },
                    },
                    {
                        text: `
You are extracting educational content from an image uploaded to StudyBuddyAI.

Carefully analyze the image and extract all useful educational information.

Your task:
- Extract all visible text.
- Preserve headings and subheadings.
- Extract mathematical equations and expressions as accurately as possible.
- Describe diagrams, charts, tables, and illustrations.
- Include labels and relationships between elements.
- Preserve the logical structure of the content.
- If the image contains handwritten notes, transcribe them as accurately as possible.
- If something is unclear, indicate that it is unclear rather than inventing content.

Return the extracted content in clean, structured text.

Do not answer questions about the image.
Do not add unrelated explanations.
Do not invent missing information.
                        `,
                    },
                ],
            },
        ],
    });

    const extractedText = cleanText(response.text || "");

    if (!extractedText) {
        throw new Error("Could not extract content from the uploaded image.");
    }

    return extractedText;
};


export const extractFileContent = async (file) => {
    if (!file) {
        throw new Error("No file was provided.");
    }

    if (!file.buffer) {
        throw new Error("Uploaded file buffer is missing.");
    }

    const fileType = SUPPORTED_TYPES[file.mimetype];

    if (!fileType) {
        throw new Error(
            `Unsupported file type: ${file.mimetype}`
        );
    }

    let extractedText;

    switch (fileType) {
        case "pdf":
            extractedText = await extractPDF(file.buffer);
            break;

        case "docx":
            extractedText = await extractDOCX(file.buffer);
            break;

        case "txt":
            extractedText = extractTXT(file.buffer);
            break;

        case "image":
            extractedText = await extractImageContent(file);
            break;

        default:
            throw new Error("Unsupported file type.");
    }

    return {
        text: extractedText,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileType,
        size: file.size,
    };
};