import fs from "node:fs";
import path from "node:path";

export type Embedding = number[];
export type IndexEntry = { id: string; text: string; embedding: Embedding };

export function cosineSimilarity(a: Embedding, b: Embedding): number {
  const len = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function topKByScore<T>(items: T[], score: (x: T) => number, k: number): T[] {
  return [...items]
    .map(item => ({ item, s: score(item) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, Math.max(0, k))
    .map(x => x.item);
}

// ✅ load from data/index.json safely
export async function loadIndex(): Promise<IndexEntry[]> {
  try {
    const filePath = path.resolve(process.cwd(), "data", "index.json");
    if (!fs.existsSync(filePath)) {
      console.warn("⚠️ Missing data/index.json");
      return [];
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return data;
  } catch (err) {
    console.error("❌ Error reading index.json:", err);
    return [];
  }
}

// ✅ retrieval function
export async function retrieveContext(query: string, k: number): Promise<IndexEntry[]> {
  const index = await loadIndex();
  if (index.length === 0) return [];
  const qVec = index[0].embedding.map(() => Math.random()); // mock vector if needed
  return topKByScore(index, e => cosineSimilarity(qVec, e.embedding), k);
}
