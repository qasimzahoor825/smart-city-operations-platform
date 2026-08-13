import { config } from "../../../config";
import type { AICategorization, CategorizeDto } from "../dto";

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
] as const;

const DEPARTMENT_ROUTES: { keywords: string[]; departmentId: string; departmentName: string }[] = [
  {
    keywords: ["road", "pothole", "street", "sidewalk", "bridge", "traffic", "asphalt", "pavement"],
    departmentId: "dept-public-works",
    departmentName: "Public Works",
  },
  {
    keywords: ["light", "lamp", "streetlight", "illuminat", "glow"],
    departmentId: "dept-public-works",
    departmentName: "Public Works",
  },
  {
    keywords: ["water", "leak", "pipe", "drain", "sewage", "flood", "garbage", "waste"],
    departmentId: "dept-water-sanitation",
    departmentName: "Water & Sanitation",
  },
  {
    keywords: ["power", "electric", "transformer", "outage", "current", "wire"],
    departmentId: "dept-public-works",
    departmentName: "Public Works",
  },
  {
    keywords: ["health", "medical", "ambulance", "sanitary", "hospital", "clinic"],
    departmentId: "dept-health-transport",
    departmentName: "Public Health & Transport",
  },
];

function guessCategory(text: string): string {
  const lower = text.toLowerCase();
  const pairs: [string, string][] = [
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
  for (const [keyword, category] of pairs) if (lower.includes(keyword)) return category;
  return "OTHER";
}

function estimatePriority(title: string, description: string): AICategorization["priority"] {
  const text = `${title} ${description}`.toLowerCase();
  if (/(fire|explosion|collapsed|flood|leak|gas|injur|emergency|severe|immediate|hazardous)/.test(text)) {
    return "CRITICAL";
  }
  if (/(broken|damage|outage|interruption|blocked|no power)/.test(text)) return "HIGH";
  if (/(minor|cosmetic|slight|small|cosmetic)/.test(text)) return "LOW";
  return "MEDIUM";
}

function routeDepartment(text: string): AICategorization["departmentId"] | null {
  const lower = text.toLowerCase();
  for (const route of DEPARTMENT_ROUTES) {
    if (route.keywords.some((k) => lower.includes(k))) return route.departmentId;
  }
  return null;
}

function findDepartmentName(id: string | null): string | null {
  if (!id) return null;
  return DEPARTMENT_ROUTES.find((r) => r.departmentId === id)?.departmentName ?? null;
}

function summaryFrom(title: string, description: string): string {
  const text = `${title}. ${description}`;
  const category = guessCategory(text);
  const priority = estimatePriority(title, description);
  return `AI flagged this as primarily a "${category}" issue with ${priority.toLowerCase()} priority based on the reported symptoms.`;
}

async function callGemini(dto: CategorizeDto): Promise<AICategorization | null> {
  const apiKey = config.ai.geminiApiKey;
  if (!apiKey) return null;

  const prompt = `You are a smart-city triage assistant. Analyze the citizen complaint below and respond with STRICT JSON (no markdown) shaped exactly like:
{"category":"ROAD|WATER|ELECTRICITY|GARBAGE|PARKS|STREET_LIGHT|NOISE|SANITATION|OTHER","priority":"LOW|MEDIUM|HIGH|CRITICAL","departmentId":null,"departmentName":null,"summary":"max 45 chars"}
Return null departmentId/departmentName — routing is inferred server-side.

Title: ${dto.title}
Description: ${dto.description}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.ai.geminiModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
      }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const payload = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return null;
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<AICategorization>;
    const category = CATEGORIES.includes(parsed.category as never) ? (parsed.category as string) : guessCategory(dto.title);
    const priority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.priority ?? "")
      ? (parsed.priority as AICategorization["priority"])
      : estimatePriority(dto.title, dto.description);
    const departmentId = routeDepartment(`${dto.title}. ${dto.description}`);
    return {
      category,
      priority,
      departmentId,
      departmentName: findDepartmentName(departmentId),
      summary: parsed.summary || summaryFrom(dto.title, dto.description),
      source: "gemini",
    };
  } catch {
    return null;
  }
}

export const aiService = {
  async categorize(dto: CategorizeDto): Promise<AICategorization> {
    const gemini = await callGemini(dto);
    if (gemini) return gemini;

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
      source: config.ai.geminiApiKey ? "error" : "heuristic",
    };
  },
};

export default aiService;