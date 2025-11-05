# 🧠 MorphNote

**MorphNote** is a GenAI-powered note enhancement and retrieval platform that transforms unstructured notes into refined, readable, and context-aware content.  
It combines **LangChain**, **FastAPI**, and **open-source LLMs** to provide AI-driven note **stylization**, **summarization**, **key point extraction**, and **PDF querying** using a **Retrieval-Augmented Generation (RAG)** pipeline.  

---

## 🚀 Features

- ✍️ **Stylize Notes** — Rewrite notes into multiple tones such as *formal*, *professional*, *creative*, *concise*, or *casual*.  
- 📘 **Summarization** — Condense lengthy notes or text into short, meaningful summaries.  
- 🔑 **Key Point Extraction** — Extract essential insights or bullet points from content.  
- 📄 **RAG-based PDF Querying** — Upload a PDF and ask natural language questions to retrieve contextually relevant answers.  
- 🎨 **Customizable Options** — Choose writing *length* and *creativity* levels for stylization.  
- ⚡ **Modern Frontend** — Built with **Next.js**, **shadcn/ui**, and **Tailwind CSS** for a sleek and responsive interface.  

---

## 🧩 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js • shadcn/ui • Tailwind CSS |
| **Backend** | Node.js • Express |
| **AI & RAG** | FastAPI • LangChain • FAISS • OpenAI / Groq  |
| **Utilities** | PyPDFLoader • RecursiveCharacterTextSplitter • OpenAIEmbeddings |

---
### Evalution
The RAG pipeline demonstrates strong performance with a context faithfulness of 0.0788 (3x improvement), excellent coherence (0.875), and high answer relevance (0.55) while maintaining controlled response lengths (mean: 271.5 chars). Our hybrid retriever (0.45/0.55 split) with cross-encoder reranking has effectively balanced semantic understanding with lexical matching.
