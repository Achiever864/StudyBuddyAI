import { createRequire } from "module";
import path from "path";
import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_AI });
const OCR_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";

const MIN_CHARS_PER_PAGE = 50;
const MAX_INLINE_BYTES = 15 * 1024 * 1024;

const OCR_PROMPT = [
    "Transcribe all the text in this document exactly as written.",
    "Keep the original reading order and paragraph breaks.",
    "For handwriting, transcribe your best reading; use [unclear] for words you cannot read.",
    "Describe diagrams or figures in one short line inside square brackets, e.g. [Diagram: ...].",
    "Return only the transcribed text, with no introduction or commentary.",
].join(" ");

const IMAGE_MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
};

export class ExtractionError extends Error {
    constructor (message, status = 422)  {
        super(message);
        this.name = "ExtractionError";
        this.status = status;
    }
}

async function ocrWithGemini(buffer, mimeType) {
    if (buffer.length > MAX_INLINE_BYTES) {
        throw new ExtractionError ("This scanned file is too large to read. Try a smaller file or fewer pages.", 413);
    }

    const response = await ai.models.generateContent({
        model: OCR_MODEL,
        contents: [
            {
                role: "user",
                parts: [
                    { inlineData: { mimeType, data: buffer.toString("base64") } },
                    { text: OCR_PROMPT },
                ],
            },
        ],
        config: { temperature: 0 },
    });

    return (response.text || "").trim();
}

async function fromPdf(buffer){
    let parsed;
    try {
        parsed = await pdfParse(buffer);
    } catch {
        parsed = null;
    }

    const text = parsed?.text?.trim() || "";
    const pages = parsed?.numpages || 1;

    if (text.length / pages >= MIN_CHARS_PER_PAGE) {
        return { text, method: "pdf-text" };
    }

    const ocrText = await ocrWithGemini(buffer, "application/pdf");
    return { text: ocrText, method: "ocr" };
}

async function fromDocx(buffer) {
    const { value } = await mammoth.extractRawText({ buffer });
    return { text: value.trim(), method: "docx" }; 
}

function fromTxt(buffer) {
    return { text: buffer.toString("utf-8").trim(), method: "txt" };
}

async function fromImage(buffer, mimeType) {
    const text = await ocrWithGemini(buffer, mimeType);
    return { text, method: "ocr" };
}

export async function extractText(file) {
    const ext = path.extname(file.originalname || "").toLowerCase();

    let result;
    if (ext === ".pdf" || file.mimetype === "application/pdf") {
        result = await fromPdf(file.buffer);
    } else if (ext === ".docx") {
        result = await fromDocx(file.buffer);
    } else if (ext === ".txt" || file.mimetype === "text/plain") {
        result = fromTxt(file.buffer);
    } else if (IMAGE_MIME[ext]){
        result = await fromImage(file.buffer, IMAGE_MIME[ext]);
    } else {
        throw new ExtractionError(
            "Unsupported file type. Please upload a PDF, DOCX, TXT, PNG or JPG.",
            415
        );
    }

    if (!result.text){
        throw new ExtractionError("No readable text was found in this file.");
    }

    return result;
}

export default { extractText, ExtractionError };