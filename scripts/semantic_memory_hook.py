#!/usr/bin/env python3
"""
Antigravity Semantic Pre-Hook Memory Engine
-------------------------------------------
Automatically queries the ChromaDB vector store before task execution,
injecting semantically relevant past learnings, bugfixes, and system rules
into the active agent decision context.
"""

import os
import sys
import json

MEMORY_DB_DIR = os.path.join(os.path.expanduser("~"), ".gemini", "antigravity", "vector_memory_db")

def query_memory_hook(prompt_text, top_k=3):
    try:
        import chromadb
        if not os.path.exists(MEMORY_DB_DIR):
            return []
        
        client = chromadb.PersistentClient(path=MEMORY_DB_DIR)
        collection = client.get_collection(name="antigravity_memory_store")
        results = collection.query(query_texts=[prompt_text], n_results=top_k)
        
        memories = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
            for doc, meta in zip(docs, metas):
                memories.append({"content": doc, "metadata": meta})
        return memories
    except Exception as e:
        return [{"error": str(e)}]

if __name__ == "__main__":
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "general development"
    relevant_memories = query_memory_hook(prompt)
    print(json.dumps({"prompt": prompt, "relevant_memories": relevant_memories}, indent=2, ensure_ascii=False))
