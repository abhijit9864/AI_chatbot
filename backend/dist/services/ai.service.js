"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIResponse = generateAIResponse;
const OLLAMA_URL = "http://localhost:11434";
async function generateAIResponse(message) {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "qwen3:4b",
            prompt: message,
            stream: false,
        }),
    });
    if (!response.ok) {
        throw new Error(`Ollama request failed with status ${response.status}`);
    }
    const data = (await response.json());
    return {
        content: data.response,
        model: data.model,
    };
}
