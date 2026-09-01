"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const config_1 = require("../../../config");
const data_1 = require("./data");
const CATEGORIES = [
    "ROAD",
    "WATER",
    "ELECTRICITY",
    "GARBAGE",
    "PARKS",
    "STREET_LIGHT",
    "NOISE",
    "SIGNAL",
    "SANITATION",
    "OTHER",
];
const DEPARTMENT_ROUTES = [
    {
        keywords: ["road", "pothole", "street", "sidewalk", "bridge", "traffic", "asphalt", "pavement"],
        departmentId: "dept-public-works",
        departmentName: "Public Works",
    },
    {
        keywords: ["streetlight", "street light", "street-light", "lamp", "illuminat", "glow", "lighting", "light out", "light outage", "downtown light"],
        departmentId: "dept-public-works",
        departmentName: "Public Works",
    },
    {
        keywords: ["water", "leak", "pipe", "drain", "flood", "sewage", "sewer", "sanitation", "garbage", "waste", "trash", "rubbish", "drainage"],
        departmentId: "dept-water-sanitation",
        departmentName: "Water & Sanitation",
    },
    {
        keywords: ["power", "electric", "transformer", "outage", "current", "wire", "electricity", "fuse", "breaker"],
        departmentId: "dept-electricity",
        departmentName: "Electricity Authority",
    },
    {
        keywords: ["garbage", "trash", "waste", "rubbish", "bin", "dump", "overflowing"],
        departmentId: "dept-municipal",
        departmentName: "Municipal Services",
    },
    {
        keywords: ["park", "playground", "garden", "tree", "greenery"],
        departmentId: "dept-municipal",
        departmentName: "Municipal Services",
    },
    {
        keywords: ["noise", "loud", "music", "party", "construction noise", "hubbub"],
        departmentId: "dept-municipal",
        departmentName: "Municipal Services",
    },
    {
        keywords: ["health", "medical", "ambulance", "hospital", "clinic", "doctor", "emergency"],
        departmentId: "dept-health",
        departmentName: "Health Department",
    },
    {
        keywords: ["transport", "bus", "metro", "train", "traffic signal", "signal", "vehicle"],
        departmentId: "dept-transport",
        departmentName: "Transport Department",
    },
    {
        keywords: ["education", "school", "college", "university"],
        departmentId: "dept-education",
        departmentName: "Education Department",
    },
    {
        keywords: ["fire", "rescue", "hazard", "collapse", "gas leak", "explosion"],
        departmentId: "dept-emergency",
        departmentName: "Emergency Services",
    },
];
function guessCategory(text) {
    const lower = text.toLowerCase();
    const pairs = [
        ["road", "ROAD"],
        ["pothole", "ROAD"],
        ["streetlight", "STREET_LIGHT"],
        ["light", "STREET_LIGHT"],
        ["lamp", "STREET_LIGHT"],
        ["water", "WATER"],
        ["leak", "WATER"],
        ["drainage", "SANITATION"],
        ["sewage", "SANITATION"],
        ["garbage", "GARBAGE"],
        ["waste", "GARBAGE"],
        ["trash", "GARBAGE"],
        ["electric", "ELECTRICITY"],
        ["transformer", "ELECTRICITY"],
        ["power", "ELECTRICITY"],
        ["park", "PARKS"],
        ["playground", "PARKS"],
        ["noise", "NOISE"],
        ["loud", "NOISE"],
    ];
    for (const [keyword, category] of pairs)
        if (lower.includes(keyword))
            return category;
    return "OTHER";
}
function estimatePriority(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (/(fire|explosion|collapsed|flood|leak|gas|injur|emergency|severe|immediate|hazardous)/.test(text)) {
        return "CRITICAL";
    }
    if (/(broken|damage|outage|interruption|blocked|no power)/.test(text))
        return "HIGH";
    if (/(minor|cosmetic|slight|small|cosmetic)/.test(text))
        return "LOW";
    return "MEDIUM";
}
function routeDepartment(text) {
    const lower = text.toLowerCase();
    for (const route of DEPARTMENT_ROUTES) {
        if (route.keywords.some((k) => lower.includes(k)))
            return route.departmentId;
    }
    return null;
}
function findDepartmentName(id) {
    if (!id)
        return null;
    return DEPARTMENT_ROUTES.find((r) => r.departmentId === id)?.departmentName ?? null;
}
function summaryFrom(title, description) {
    const text = `${title}. ${description}`;
    const category = guessCategory(text);
    const priority = estimatePriority(title, description);
    return `AI flagged this as primarily a "${category}" issue with ${priority.toLowerCase()} priority based on the reported symptoms.`;
}
async function askGemini(system, history, prompt, maxTokens) {
    const apiKey = config_1.config.ai.geminiApiKey;
    if (!apiKey)
        return null;
    const contents = history.map((t) => ({
        role: t.role === "assistant" ? "model" : "user",
        parts: [{ text: t.content }],
    }));
    contents.push({ role: "user", parts: [{ text: prompt }] });
    const body = {
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens },
    };
    if (system)
        body.systemInstruction = { parts: [{ text: system }] };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config_1.config.ai.geminiModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok)
            return null;
        const payload = (await res.json());
        return payload.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text?.trim() || null;
    }
    catch {
        return null;
    }
}
async function askOpenRouter(system, history, prompt, maxTokens) {
    const apiKey = config_1.config.ai.openRouterApiKey;
    if (!apiKey)
        return null;
    const messages = [];
    if (system)
        messages.push({ role: "system", content: system });
    messages.push(...history.map((t) => ({ role: t.role, content: t.content })));
    messages.push({ role: "user", content: prompt });
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model: config_1.config.ai.aiModel, messages, max_tokens: maxTokens }),
            signal: AbortSignal.timeout(20_000),
        });
        if (!res.ok)
            return null;
        const payload = (await res.json());
        return payload.choices?.[0]?.message?.content?.trim() || null;
    }
    catch {
        return null;
    }
}
async function askModel(system, history, prompt, maxTokens) {
    const primary = config_1.config.ai.provider === "openrouter" ? askOpenRouter : askGemini;
    const fallback = config_1.config.ai.provider === "openrouter" ? askGemini : askOpenRouter;
    const first = await primary(system, history, prompt, maxTokens);
    if (first)
        return first;
    return fallback(system, history, prompt, maxTokens);
}
// --- Streaming (SSE) variants for the chat endpoint -------------------------
async function* streamGemini(system, history, prompt, maxTokens) {
    const apiKey = config_1.config.ai.geminiApiKey;
    if (!apiKey)
        return;
    const contents = history.map((t) => ({
        role: t.role === "assistant" ? "model" : "user",
        parts: [{ text: t.content }],
    }));
    contents.push({ role: "user", parts: [{ text: prompt }] });
    const body = {
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens },
    };
    if (system)
        body.systemInstruction = { parts: [{ text: system }] };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config_1.config.ai.geminiModel}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok || !res.body)
            return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split("\n\n");
            buffer = events.pop() ?? "";
            for (const event of events) {
                const line = event
                    .split("\n")
                    .find((l) => l.startsWith("data:"))
                    ?.slice(5)
                    .trim();
                if (!line)
                    continue;
                try {
                    const chunk = JSON.parse(line);
                    const text = chunk.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
                    if (text)
                        yield text;
                }
                catch {
                    // skip malformed chunk
                }
            }
        }
    }
    catch {
        // network error — stream just ends
    }
}
async function* streamOpenRouter(system, history, prompt, maxTokens) {
    const apiKey = config_1.config.ai.openRouterApiKey;
    if (!apiKey)
        return;
    const messages = [];
    if (system)
        messages.push({ role: "system", content: system });
    messages.push(...history.map((t) => ({ role: t.role, content: t.content })));
    messages.push({ role: "user", content: prompt });
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: config_1.config.ai.aiChatModel,
                messages,
                max_tokens: maxTokens,
                stream: true,
            }),
            signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok || !res.body)
            return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:"))
                    continue;
                const payload = trimmed.slice(5).trim();
                if (payload === "[DONE]")
                    continue;
                try {
                    const chunk = JSON.parse(payload);
                    const delta = chunk.choices?.[0]?.delta?.content;
                    if (delta)
                        yield delta;
                }
                catch {
                    // skip malformed chunk
                }
            }
        }
    }
    catch {
        // network error — stream just ends
    }
}
// ---------------------------------------------------------------------------
// Complaint triage — AI first, deterministic fallback.
// ---------------------------------------------------------------------------
async function callGemini(dto) {
    const prompt = `You are a smart-city triage assistant. Analyze the citizen complaint below and respond with STRICT JSON (no markdown) shaped exactly like:
{"category":"ROAD|WATER|ELECTRICITY|GARBAGE|PARKS|STREET_LIGHT|NOISE|SANITATION|OTHER","priority":"LOW|MEDIUM|HIGH|CRITICAL","departmentId":null,"departmentName":null,"summary":"max 45 chars"}
Return null departmentId/departmentName — routing is inferred server-side.

Title: ${dto.title}
Description: ${dto.description}`;
    const raw = await askModel(undefined, [], prompt, 2048);
    if (!raw)
        return null;
    try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        if (start === -1 || end === -1)
            return null;
        const parsed = JSON.parse(cleaned.slice(start, end + 1));
        const category = CATEGORIES.includes(parsed.category) ? parsed.category : guessCategory(dto.title);
        const priority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.priority ?? "")
            ? parsed.priority
            : estimatePriority(dto.title, dto.description);
        const departmentId = routeDepartment(`${dto.title}. ${dto.description}`);
        return {
            category,
            priority,
            departmentId,
            departmentName: findDepartmentName(departmentId),
            summary: parsed.summary || summaryFrom(dto.title, dto.description),
            source: config_1.config.ai.provider === "openrouter" ? "openrouter" : "gemini",
        };
    }
    catch {
        return null;
    }
}
// ---------------------------------------------------------------------------
// Citizen assistant (chatbot) — AI first, deterministic data fallback.
// ---------------------------------------------------------------------------
async function callGeminiChat(dto, dataBrief, user) {
    const system = [
        "You are SmartCity Assist, the friendly AI assistant for the Enterprise Smart City Operating System.",
        "Help citizens and municipal staff with complaints, bills, appointments, GIS maps, IoT sensor alerts and emergency guidance.",
        "Answer ONLY from the live system data provided in the conversation context. Never invent figures.",
        "Keep answers concise (under 120 words), practical and helpful, and mention the relevant app section when useful.",
        user ? `Current user context: role=${user.role}, email=${user.email}.` : "No user context.",
    ].join(" ");
    const history = (dto.history ?? []).map((turn) => ({ role: turn.role, content: turn.content }));
    const prompt = `LIVE SYSTEM DATA:\n${dataBrief}\n\nQuestion: ${dto.message}`;
    return askModel(system, history, prompt, 1024);
}
exports.aiService = {
    async categorize(dto) {
        const gemini = await callGemini(dto);
        if (gemini)
            return gemini;
        const text = `${dto.title}. ${dto.description}`;
        const category = guessCategory(text);
        const priority = estimatePriority(dto.title, dto.description);
        const departmentId = routeDepartment(text);
        return {
            category,
            priority,
            departmentId,
            departmentName: findDepartmentName(departmentId),
            summary: summaryFrom(dto.title, dto.description),
            source: config_1.config.ai.geminiApiKey ? "error" : "heuristic",
        };
    },
    async chat(dto, user) {
        const dataAnswer = (0, data_1.answerWithData)(dto, user);
        const geminiReply = await callGeminiChat(dto, dataAnswer.dataBrief, user);
        if (geminiReply) {
            return {
                reply: geminiReply,
                source: config_1.config.ai.provider === "openrouter" ? "openrouter" : "gemini",
                intent: dataAnswer.intent,
                suggestions: dataAnswer.suggestions,
            };
        }
        return {
            reply: dataAnswer.reply,
            source: "heuristic",
            intent: dataAnswer.intent,
            suggestions: dataAnswer.suggestions,
        };
    },
    async *chatStream(dto, user) {
        const dataAnswer = (0, data_1.answerWithData)(dto, user);
        const primary = config_1.config.ai.provider === "openrouter"
            ? config_1.config.ai.openRouterApiKey
                ? streamOpenRouter
                : streamGemini
            : config_1.config.ai.geminiApiKey
                ? streamGemini
                : streamOpenRouter;
        const source = primary === streamOpenRouter ? "openrouter" : "gemini";
        yield { type: "meta", intent: dataAnswer.intent, suggestions: dataAnswer.suggestions ?? [], source };
        const system = [
            "You are SmartCity Assist, the friendly AI assistant for the Enterprise Smart City Operating System.",
            "Help citizens and municipal staff with complaints, bills, appointments, GIS maps, IoT sensor alerts and emergency guidance.",
            "Answer ONLY from the live system data provided in the conversation context. Never invent figures.",
            "Keep answers concise (under 120 words), practical and helpful, and mention the relevant app section when useful.",
            user ? `Current user context: role=${user.role}, email=${user.email}.` : "No user context.",
        ].join(" ");
        const history = (dto.history ?? []).map((turn) => ({ role: turn.role, content: turn.content }));
        const prompt = `LIVE SYSTEM DATA:\n${dataAnswer.dataBrief}\n\nQuestion: ${dto.message}`;
        let streamed = false;
        for await (const chunk of primary(system, history, prompt, 1024)) {
            streamed = true;
            yield { type: "delta", text: chunk };
        }
        if (!streamed)
            yield { type: "delta", text: dataAnswer.reply };
        yield { type: "done" };
    },
    async validateImage(dto) {
        const apiKey = config_1.config.ai.geminiApiKey;
        const category = dto.category.trim();
        if (!apiKey) {
            return { accepted: true, reason: "Image validation unavailable without an AI key; proceeding.", source: "heuristic" };
        }
        const mimeMatch = dto.imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!mimeMatch) {
            return { accepted: false, reason: "Invalid image data format.", source: "heuristic" };
        }
        const [, mime, base64] = mimeMatch;
        const prompt = [
            "You are an image moderator for a smart-city complaint system.",
            `A citizen submitted this photo for the category "${category}".`,
            "Categories are: ROAD (potholes, damaged roads, sidewalks), WATER (leaks, pipes, drainage, floods), ELECTRICITY (power/transformer/wires), GARBAGE (trash, waste, overflowing bins), PARKS (parks, playgrounds), STREET_LIGHT (street lamps/lighting), NOISE (noisy activities), SANITATION (sewage, cleanliness), OTHER (anything else).",
            "Decide whether the image actually depicts an issue matching the selected category, or is clearly relevant to the complaint.",
            "Respond with STRICT JSON (no markdown) exactly like: {\"accepted\":true,\"reason\":\"short reason\"}",
            "Set accepted=true if the photo plausibly matches the category or is clearly a real photo of an infrastructure/environment issue. Set accepted=false only if it is clearly unrelated (e.g. a selfie, a random object, a screenshot, a document, blank image, or obviously not depicting the reported issue).",
            "The reason must be a short sentence (max 60 chars).",
        ].join(" ");
        const body = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { inlineData: { mimeType: mime, data: base64 } },
                        { text: prompt },
                    ],
                },
            ],
            generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
        };
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config_1.config.ai.geminiModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
            if (!res.ok) {
                return { accepted: true, reason: "Vision service unavailable; proceeding.", source: "heuristic" };
            }
            const payload = (await res.json());
            const text = payload.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text?.trim();
            if (!text) {
                return { accepted: true, reason: "No judgement returned; proceeding.", source: "heuristic" };
            }
            const cleaned = text.replace(/```json|```/g, "").trim();
            const start = cleaned.indexOf("{");
            const end = cleaned.lastIndexOf("}");
            if (start === -1 || end === -1) {
                return { accepted: true, reason: "Unparseable judgement; proceeding.", source: "heuristic" };
            }
            const parsed = JSON.parse(cleaned.slice(start, end + 1));
            return {
                accepted: parsed.accepted !== false,
                reason: parsed.reason || "Image reviewed.",
                source: "gemini",
            };
        }
        catch {
            return { accepted: true, reason: "Image validation error; proceeding.", source: "heuristic" };
        }
    },
};
exports.default = exports.aiService;
//# sourceMappingURL=index.js.map