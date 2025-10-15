import { NextRequest, NextResponse } from "next/server";
import { loadIndex, retrieveContext, IndexEntry } from "@/lib/retrieve";
import Groq from "groq-sdk";

type ChatMessageRole = "user" | "assistant" | "system";
type Message = { role: ChatMessageRole; content: string };

export const runtime = "nodejs";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin") ?? undefined) });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin") ?? undefined);
  try {
    const body = await req.json().catch(() => ({}));
    const messages = (body?.messages ?? []) as Message[];
    const userMsg = messages.filter(m => m.role === "user").pop()?.content?.trim() ?? "";

    if (!userMsg) {
      return NextResponse.json({ error: "Empty message." }, { status: 400, headers });
    }

    const index = await loadIndex();
    if (index.length === 0) {
      return NextResponse.json({ reply: "⚠️ No CV data found. Please run build-index-local.py first." }, { headers });
    }

    const retrieved = await retrieveContext(userMsg, 5);
    const context = retrieved.map((r, i) => `(${i + 1}) ${r.text}`).join("\n");

    const system = [
      "You are a helpful assistant for Aya Mekni’s portfolio.",
      "Answer using context below when relevant.",
      "If unsure, say you don’t have that info.",
      "If asked about availability: Aya seeks a 6-month internship in Europe starting Jan 2026."
    ].join(" ");

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        ...messages.slice(-6),
        { role: "user", content: `Context:\n${context}\n\nUser: ${userMsg}` }
      ]
    });

    const reply = response?.choices?.[0]?.message?.content ?? "No response.";
    return NextResponse.json({ reply, references: retrieved }, { headers });
  } catch (e: any) {
    console.error("❌ Chat route error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500, headers });
  }
}
