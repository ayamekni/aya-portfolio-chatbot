import os
import json
import re
from markdown import markdown
from sentence_transformers import SentenceTransformer

# ==============================
# CONFIGURATION
# ==============================
DATA_DIR = os.path.join(os.getcwd(), "data")
CV_PATH = os.path.join(DATA_DIR, "cv.md")
OUT_PATH = os.path.join(DATA_DIR, "index.json")
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 700  # characters per chunk (approx.)

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


def chunk_text(text: str, max_len: int = CHUNK_SIZE):
    """Split long text into chunks of ~max_len characters."""
    words = text.split()
    chunks, current = [], []
    for w in words:
        current.append(w)
        if len(" ".join(current)) >= max_len:
            chunks.append(" ".join(current))
            current = []
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

    print("📄 Reading CV...")
    with open(CV_PATH, "r", encoding="utf-8") as f:
        md = f.read()

    clean_text = strip_markdown(md)
    chunks = chunk_text(clean_text)
    print(f"🧩 Split into {len(chunks)} chunks.")

    print(f"⚙️ Loading model '{MODEL_NAME}'...")
    model = SentenceTransformer(MODEL_NAME)

    print("🧠 Generating embeddings locally (no API calls)...")
    embeddings = model.encode(chunks, convert_to_numpy=True, show_progress_bar=True)

    index = []
    for i, (text, emb) in enumerate(zip(chunks, embeddings)):
        index.append({
            "id": str(i),
            "text": text,
            "embedding": emb.tolist()
        })

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved {len(index)} chunks with embeddings → {OUT_PATH}")


if __name__ == "__main__":
    main()
