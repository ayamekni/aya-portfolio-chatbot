import os
import json
import re
from markdown import markdown
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# ==============================
# CONFIGURATION
# ==============================
DATA_DIR = os.path.join(os.getcwd(), "data")
CV_PATH = os.path.join(DATA_DIR, "cv.md")  # your markdown resume file
OUT_PATH = os.path.join(DATA_DIR, "index.json")
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 800  # slightly larger chunks = better section coherence
OVERLAP = 120     # overlap words between chunks for smoother context

# ==============================
# HELPER FUNCTIONS
# ==============================

def strip_markdown(md_text: str) -> str:
    """Remove markdown/HTML tags to get clean text."""
    html = markdown(md_text)
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"&[a-z]+;", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def smart_chunk_by_section(text: str, max_len: int = CHUNK_SIZE):
    """
    Split CV text by major headings (Experience, Projects, etc.)
    before chunking to preserve logical sections.
    """
    # Split on markdown headers or section keywords
    sections = re.split(
        r"(?:## |### |# |\n\s*---\s*|\n\s*##\s*|\n\s*Experience|Projects|Education|Skills|Certifications|Profile|Internship)",
        text,
        flags=re.IGNORECASE,
    )
    chunks = []
    for s in sections:
        s = s.strip()
        if not s:
            continue
        words = s.split()
        current = []
        for w in words:
            current.append(w)
            if len(" ".join(current)) >= max_len:
                chunks.append(" ".join(current))
                # Add overlap for smoother retrieval
                current = current[-OVERLAP:]
        if current:
            chunks.append(" ".join(current))
    return chunks


# ==============================
# MAIN PIPELINE
# ==============================
def main():
    if not os.path.exists(CV_PATH):
        print("❌ Missing data/cv.md — please add your resume text file.")
        return

    print("📄 Reading Aya’s CV...")
    with open(CV_PATH, "r", encoding="utf-8") as f:
        md = f.read()

    clean_text = strip_markdown(md)
    print(f"🧹 Cleaned text length: {len(clean_text)} characters")

    chunks = smart_chunk_by_section(clean_text)
    print(f"🧩 Split into {len(chunks)} context chunks.")

    print(f"⚙️ Loading model '{MODEL_NAME}'...")
    model = SentenceTransformer(MODEL_NAME)

    print("🧠 Generating embeddings locally (no API calls)...")
    embeddings = model.encode(chunks, convert_to_numpy=True, show_progress_bar=True)

    index = []
    for i, (text, emb) in tqdm(enumerate(zip(chunks, embeddings)), total=len(chunks)):
        index.append({
            "id": str(i),
            "text": text,
            "embedding": emb.tolist()
        })

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved {len(index)} chunks with embeddings → {OUT_PATH}")
    print("✨ Aya’s updated CV index is ready for your chatbot!")


if __name__ == "__main__":
    main()
