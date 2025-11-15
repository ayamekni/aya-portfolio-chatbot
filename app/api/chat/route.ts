import { NextRequest, NextResponse } from "next/server";
import { loadIndex, retrieveContext } from "@/lib/retrieve";
import Groq from "groq-sdk";

type ChatMessageRole = "user" | "assistant" | "system";
type Message = { role: ChatMessageRole; content: string };

export const runtime = "nodejs";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🧩 Handle CORS
function corsHeaders(origin?: string) {
  const allowed = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const isAllowed = origin && allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin") ?? undefined)
  });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin") ?? undefined);
  try {
    const body = await req.json().catch(() => ({}));
    const messages = (body?.messages ?? []) as Message[];
    const userMsg =
      messages.filter(m => m.role === "user").pop()?.content?.trim() ?? "";

    if (!userMsg) {
      return NextResponse.json(
        { error: "Empty message." },
        { status: 400, headers }
      );
    }

    // 🧠 Load Aya’s CV embeddings index
    const index = await loadIndex();
    if (index.length === 0) {
      return NextResponse.json(
        { reply: "⚠️ No CV data found. Please run `npm run embed` first." },
        { headers }
      );
    }

    // 🎯 Retrieve top relevant context
    const retrieved = await retrieveContext(userMsg, 5);
    const context = retrieved.map((r, i) => `(${i + 1}) ${r.text}`).join("\n");

    // 💬 Friendly, recruiter-focused personality prompt
    const system = [
      "You are Aya Mekni’s friendly and professional AI assistant.",
      "You represent Aya as a confident, skilled, and motivated Data Scientist and AI Engineer.",
      "Aya is currently seeking a 6-month end-of-study internship (PFE) starting in **January 2026**, where she can apply her expertise in AI, NLP, RAG systems, and data-driven innovation.",
      "Your tone must be warm, respectful, and recruiter-friendly — highlight Aya’s achievements, technical depth, and passion for AI.",
      "Use Markdown for formatting: short paragraphs, • bullet points, **bold** highlights, and clean line breaks.",
      "Keep responses concise but complete (not cropped); under ~6 short sections is ideal.",
      "Always end with a helpful closing such as 'How can I assist you further?' or 'Would you like to know more about Aya’s projects or experience?'",
      "Avoid being robotic — sound human, supportive, and proud to represent Aya."
    ].join(" ");

    // 🚀 Send to Groq model
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.5,
      messages: [
        { role: "system", content: system },
        ...messages.slice(-6),
        {
          role: "user",
          content: `Relevant information from Aya’s CV:\n${context}\n\nUser: ${userMsg}`
        }
      ]
    });

    // ✅ Clean, full response (no truncation)
    const reply =
      response?.choices?.[0]?.message?.content?.trim() ??
      "No response available.";

    return NextResponse.json({ reply, references: retrieved }, { headers });
  } catch (e: any) {
    console.error("❌ Chat route error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500, headers }
    );
  }
}
