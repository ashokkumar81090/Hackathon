# 🚀 RAG-MONGO-POLIGER-Langchain

**Incident RAG System** built with **LangChain**, **Mistral AI / OpenAI Embeddings**, and **MongoDB Atlas Vector Search**.

This project demonstrates a production-ready RAG (Retrieval-Augmented Generation) system for IT incident management, leveraging the power of LangChain framework for rapid development and best practices.

**Embeddings Support**: Mistral AI (1024D) or OpenAI (3072D/1536D)

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Comparison: Framework vs From-Scratch](#comparison)

---

## ✨ Features

- 🔍 **Hybrid Search**: Combines semantic vector search with BM25 keyword search
- ⛓️ **LangChain Integration**: Leverages LangChain for RAG pipeline orchestration
- 🤖 **Multi-LLM Support**: OpenAI, Groq, Anthropic (Claude)
- 📊 **Multi-Provider Embeddings**: 
  - **Mistral AI**: mistral-embed (1024 dimensions) ⭐ Default
  - **OpenAI**: text-embedding-3-large (3072 dimensions)
  - **OpenAI**: text-embedding-3-small (1536 dimensions)
- 🗄️ **MongoDB Atlas**: Vector search with filtering capabilities
- 🎯 **TypeScript**: Full type safety and IntelliSense support
- ⚡ **Fast Development**: Framework-driven approach for rapid prototyping
- 🔌 **RESTful API**: Express server with clean endpoints

---

## 🏗️ Architecture

```
User Query
    ↓
Express API Server
    ↓
LangChain RAG Chain
    ↓
Retrieval Pipeline
    ├─→ Vector Search (MongoDB Atlas + Mistral/OpenAI Embeddings)
    └─→ Keyword Search (MongoDB Atlas BM25)
    ↓
Score Fusion (Weighted Hybrid)
    ↓
Context Generation
    ↓
LLM Generation (OpenAI/Groq/Anthropic)
    ↓
Structured Response
```

---

## 🛠️ Tech Stack

### Core Framework
- **LangChain**: RAG orchestration and chain management
- **@langchain/mongodb**: MongoDB Atlas Vector Search integration
- **@langchain/openai**: OpenAI embeddings and chat models
- **@langchain/groq**: Groq LLM integration
- **@langchain/anthropic**: Anthropic Claude integration

### Infrastructure
- **MongoDB Atlas**: Vector database with Atlas Search
- **Express**: RESTful API server
- **TypeScript**: Type-safe development
- **Node.js 18+**: Runtime environment

---

## 📦 Prerequisites

1. **Node.js** 18 or higher
2. **MongoDB Atlas** account (M0 free tier works)
3. **OpenAI API Key** (for embeddings and optionally LLM)
4. **Groq/Anthropic API Key** (optional, for LLM)
5. **Incident Data** in JSON format

---

## 🚀 Installation

### 1. Clone/Navigate to Project

```bash
cd /Users/mohakh-blrm24/RAG-MONGO-POLIGER-Langchain
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

#### Option A: Using Mistral AI Embeddings (Default, Recommended) ⭐

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=incidents_db
COLLECTION_NAME=incidents
VECTOR_INDEX_NAME=incidents_vector_index

# Embeddings Configuration
EMBEDDINGS_PROVIDER=mistral
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_EMBEDDING_MODEL=mistral-embed

# LLM Model Configuration (for queries only)
MODEL_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.3-70b-versatile

# Server Configuration
PORT=3001
TEMPERATURE=0.1
MAX_TOKENS=4096

# Search Configuration
DEFAULT_TOP_K=5
HYBRID_VECTOR_WEIGHT=0.6
HYBRID_KEYWORD_WEIGHT=0.4
```

#### Option B: Using OpenAI Embeddings

```env
# Embeddings Configuration
EMBEDDINGS_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
OPENAI_EMBEDDING_DIMENSIONS=3072

# Rest of the configuration same as Option A
```

📖 **For complete setup instructions**, see: [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)

---

## ⚙️ Configuration

### Step 1: Prepare Incident Data

Place your `incidents.json` file in `src/data/`:

```json
[
  {
    "incidentId": "INC-001",
    "summary": "Application crashes on startup",
    "description": "The application fails to start...",
    "status": "Resolved",
    "priority": "High",
    "category": "Software",
    "rootCause": "Memory leak in initialization",
    "resolutionSteps": "Updated memory allocation...",
    "createdDate": "2024-01-15",
    "resolvedDate": "2024-01-16"
  }
]
```

### Step 2: Create MongoDB Atlas Indexes

📖 **Complete instructions**: See [`SETUP_GUIDE.md`](./SETUP_GUIDE.md#mongodb-atlas-setup)

You need to create **TWO** indexes in MongoDB Atlas:
- **Vector Search Index**: `vector_index_incidents` (1024D for Mistral)
- **BM25 Search Index**: `BM25_incidents` (keyword search)

Index configurations are in:
- `src/config/vectorindex.json`
- `src/config/bm25index.json`

### Step 3: Ingest Incidents

```bash
# Ingest incidents (adds to existing data)
npm run ingest

# Clear and re-ingest
npm run ingest:clear
```

---

## 🎮 Usage

### Start the Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

Server will start on `http://localhost:3001`

### Test Search

```bash
npm run test:search
```

### API Examples

#### 1. Search Incidents

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Application crashes on startup",
    "searchType": "hybrid",
    "topK": 5
  }'
```

#### 2. RAG Query (Get AI Answer)

```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I fix database connection timeouts?",
    "searchType": "hybrid",
    "topK": 5
  }'
```

#### 3. Health Check

```bash
curl http://localhost:3001/health
```

#### 4. Statistics

```bash
curl http://localhost:3001/api/stats
```

---

## 📚 API Documentation

### POST `/api/search`

Search for relevant incidents.

**Request:**
```json
{
  "query": "Application crashes",
  "searchType": "hybrid",  // "vector" | "keyword" | "hybrid"
  "topK": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "incident": {
          "incidentId": "INC-001",
          "summary": "Application crashes on startup",
          "status": "Resolved",
          "priority": "High",
          "rootCause": "Memory leak",
          "resolutionSteps": "Updated memory allocation"
        },
        "score": 0.923,
        "matchType": "hybrid",
        "content": "..."
      }
    ],
    "metadata": {
      "searchType": "hybrid",
      "resultsCount": 5,
      "processingTime": 234
    }
  }
}
```

### POST `/api/query`

Get AI-generated answer based on relevant incidents.

**Request:**
```json
{
  "query": "How do I fix database connection timeouts?",
  "searchType": "hybrid",
  "topK": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "How do I fix database connection timeouts?",
    "answer": "Based on incidents INC-042 and INC-087, database connection timeouts can be resolved by: 1) Increasing connection pool size...",
    "relevantIncidents": [...],
    "metadata": {
      "searchMethod": "hybrid",
      "processingTime": 1523,
      "model": "llama-3.3-70b-versatile",
      "timestamp": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

---

## 📁 Project Structure

```
RAG-MONGO-POLIGER-Langchain/
├── src/
│   ├── config/
│   │   └── index.ts                    # Configuration management
│   ├── types/
│   │   ├── incident.ts                 # Incident types
│   │   ├── search.ts                   # Search types
│   │   ├── api.ts                      # API types
│   │   └── index.ts                    # Type exports
│   ├── lib/
│   │   ├── embeddings/
│   │   │   ├── openaiEmbeddings.ts    # OpenAI embeddings (1536D)
│   │   │   └── index.ts
│   │   ├── models/
│   │   │   ├── factory.ts              # LLM model factory
│   │   │   └── index.ts
│   │   ├── vectorstore/
│   │   │   ├── incidentVectorStore.ts  # MongoDB Atlas vector store
│   │   │   └── index.ts
│   │   ├── prompts/
│   │   │   ├── incidentPrompts.ts      # RAG prompts
│   │   │   └── index.ts
│   │   ├── chain.ts                    # LangChain RAG chain
│   │   └── index.ts
│   ├── pipelines/
│   │   ├── ingestion/
│   │   │   ├── pipeline.ts             # Ingestion pipeline
│   │   │   └── index.ts
│   │   ├── retrieval/
│   │   │   ├── types.ts                # Search types
│   │   │   ├── vectorSearch.ts         # Vector search engine
│   │   │   ├── keywordSearch.ts        # BM25 keyword search
│   │   │   ├── hybridSearch.ts         # Hybrid search fusion
│   │   │   ├── pipeline.ts             # Retrieval orchestrator
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── scripts/
│   │   ├── ingestIncidents.ts          # Data ingestion script
│   │   ├── createVectorIndex.ts        # Index setup helper
│   │   └── testSearch.ts               # Search testing
│   ├── data/
│   │   └── incidents.json              # Incident data (add your data here)
│   └── server.ts                       # Express API server
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔍 Comparison: Framework vs From-Scratch

This project demonstrates the **same RAG functionality** as RAG-MONGO-POLIGER, but using **LangChain framework**:

| Aspect | RAG-MONGO-POLIGER | RAG-MONGO-POLIGER-Langchain |
|--------|-------------------|------------------------------|
| **Approach** | From-scratch implementation | Framework-driven (LangChain) |
| **Dependencies** | 8 packages (minimal) | 14+ packages (framework) |
| **Code Volume** | More code (manual) | Less code (abstracted) |
| **Development Speed** | Slower | **Faster** |
| **Learning Curve** | Learn RAG concepts | Learn LangChain API |
| **Flexibility** | Full control | Limited by framework |
| **Debugging** | Easier (transparent) | Harder (black box) |
| **Embeddings** | OpenAI (1536D) | OpenAI (1536D) |
| **Vector Store** | Raw MongoDB operations | `@langchain/mongodb` |
| **RAG Chain** | Manual implementation | `RunnableSequence` |
| **Best For** | Learning internals | Production apps |

### Key LangChain Benefits

✅ **Rapid Development**: Pre-built components accelerate development  
✅ **Best Practices**: Framework enforces proven patterns  
✅ **Community Support**: Large ecosystem and documentation  
✅ **Maintainability**: Framework handles updates and improvements  
✅ **Composability**: Easy to swap LLMs, embeddings, vector stores  

### When to Use Each Approach

**Use LangChain (this project) when:**
- Building production applications quickly
- Need multi-provider support (LLMs, embeddings)
- Want community-backed solutions
- Team is familiar with frameworks

**Use from-scratch (POLIGER) when:**
- Learning RAG fundamentals deeply
- Need maximum performance optimization
- Require full control over every component
- Building highly customized systems

---

## 🎯 Performance

Based on ~3000 incidents:

- **Ingestion**: ~30-60 seconds (with batch processing)
- **Vector Search**: ~300-500ms per query
- **Hybrid Search**: ~500-800ms per query
- **RAG Query (full)**: ~1-2 seconds (including LLM generation)

---

## 🐛 Troubleshooting

### No Results from Search

1. Check if incidents are ingested: `curl http://localhost:3001/api/stats`
2. Verify MongoDB Atlas indexes are created and active
3. Ensure index names match `.env` configuration

### Embedding Generation Fails

1. Verify `OPENAI_API_KEY` is set correctly
2. Check OpenAI API quota and billing
3. Ensure network connectivity

### LLM Errors

1. Verify API key for chosen provider (`GROQ_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`)
2. Check `MODEL_PROVIDER` setting in `.env`
3. Verify model name is correct for the provider

---

## 📄 License

MIT

---

## 🤝 Contributing

This is a reference implementation. For modifications:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Document changes

---

## 📖 Additional Documentation

| Document | Description |
|----------|-------------|
| [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) | **Complete setup guide** - Installation, MongoDB, ServiceNow, Testing |
| [`FEATURES.md`](./FEATURES.md) | **Feature documentation** - Query preprocessing, filters, hybrid search |
| [`SAMPLE_QUERIES.md`](./SAMPLE_QUERIES.md) | **200+ sample queries** for testing the RAG system |
| [`TEST_ENDPOINTS.md`](./TEST_ENDPOINTS.md) | API endpoints and curl examples |
| [`QUICKSTART.md`](./QUICKSTART.md) | Quick start guide |
| [`COMPARISON.md`](./COMPARISON.md) | Framework vs From-Scratch comparison |
| `src/config/vectorindex.json` | Vector index config (1024D Mistral) |
| `src/config/bm25index.json` | BM25 keyword search index config |

---

## 📚 External Resources

- [LangChain Documentation](https://js.langchain.com/)
- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

---

**Built with ❤️ using LangChain, Mistral AI / OpenAI, and MongoDB Atlas**

