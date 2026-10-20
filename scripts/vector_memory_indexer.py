#!/usr/bin/env python3
"""
Antigravity Vector Memory Auto-Indexer
--------------------------------------
Indexes project architecture decisions, bug fixes, and solution blueprints
into a local persistent ChromaDB vector store for instant zero-cost semantic lookup.
"""

import os
import sys
import json
import chromadb

MEMORY_DB_DIR = os.path.join(os.path.expanduser("~"), ".gemini", "antigravity", "vector_memory_db")
os.makedirs(MEMORY_DB_DIR, exist_ok=True)

client = chromadb.PersistentClient(path=MEMORY_DB_DIR)
collection = client.get_or_create_collection(name="antigravity_memory_store")

def index_memory_item(item_id, text, metadata):
    collection.upsert(
        ids=[item_id],
        documents=[text],
        metadatas=[metadata]
    )
    print(f"[Memory Indexer] Successfully indexed item: {item_id}")

def search_memory(query, n_results=3):
    results = collection.query(query_texts=[query], n_results=n_results)
    return results

def bootstrap_initial_memory():
    items = [
        {
            "id": "fix_next_config_redirect",
            "text": "Removed dummy placeholder redirect to example.com from next.config.js to prevent hijacking live app traffic on Vercel/Railway.",
            "metadata": {"type": "bugfix", "category": "next_config", "date": "2026-10-01"}
        },
        {
            "id": "fix_security_js_regex",
            "text": "Fixed stateful /g regex lastIndex pointer mutation bug in security.js validateComment and refactored ReDoS patterns.",
            "metadata": {"type": "bugfix", "category": "security", "date": "2026-10-01"}
        },
        {
            "id": "dockerfile_multistage_env",
            "text": "Multi-stage Dockerfile configured with explicit NODE_ENV=development in deps and NODE_ENV=production in runtime to speed up Railway builds.",
            "metadata": {"type": "architecture", "category": "docker", "date": "2026-10-01"}
        },
        {
            "id": "playwright_e2e_testing",
            "text": "Integrated Playwright E2E visual and functional testing suite with desktop and mobile viewports.",
            "metadata": {"type": "testing", "category": "e2e", "date": "2026-10-01"}
        }
    ]
    for item in items:
        index_memory_item(item["id"], item["text"], item["metadata"])

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--search":
        query = " ".join(sys.argv[2:])
        print(f"Searching memory for: '{query}'")
        res = search_memory(query)
        print(json.dumps(res, indent=2, ensure_ascii=False))
    else:
        print("Bootstrapping vector memory store...")
        bootstrap_initial_memory()
        print("Vector Memory Store initialized.")
