# 🚀 Complete Setup Guide - RAG MongoDB LangChain System

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [ServiceNow Integration](#servicenow-integration)
4. [Embeddings Configuration](#embeddings-configuration)
5. [Testing](#testing)

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- API Keys: Mistral AI, Groq, ServiceNow (optional)

### Installation
```bash
# Clone and install
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Create MongoDB indexes (see below)

# Ingest data
npm run ingest

# Start the system
npm run dev
```

Visit: **http://localhost:3000**

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create Vector Search Index

**Index Name:** `vector_index_incidents`

**Configuration:**
```json
{
  "fields": [
    {
      "numDimensions": 1024,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    },
    {
      "path": "incidentId",
      "type": "filter"
    },
    {
      "path": "status",
      "type": "filter"
    },
    {
      "path": "priority",
      "type": "filter"
    },
    {
      "path": "category",
      "type": "filter"
    }
  ]
}
```

### Step 2: Create BM25 Search Index

**Index Name:** `BM25_incidents`

**Configuration:**
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "incidentId": { "type": "string", "analyzer": "lucene.keyword" },
      "summary": { "type": "string", "analyzer": "lucene.standard" },
      "description": { "type": "string", "analyzer": "lucene.standard" },
      "priority": { "type": "string", "analyzer": "lucene.keyword" },
      "status": { "type": "string", "analyzer": "lucene.keyword" },
      "category": { "type": "string", "analyzer": "lucene.keyword" },
      "searchableText": { "type": "string", "analyzer": "lucene.standard" }
    }
  }
}
```

**How to Create:**
1. Go to MongoDB Atlas → Browse Collections
2. Select `incidents_db` → `incidents`
3. Click "Search Indexes" tab
4. Create Search Index → JSON Editor
5. Paste configuration above
6. Wait 2-5 minutes for "Active" status

---

## 🔌 ServiceNow Integration

### Option 1: Personal Developer Instance (Free)

1. Sign up: https://developer.servicenow.com
2. Get credentials from your instance
3. Add to `.env`:

```bash
SERVICENOW_INSTANCE_URL=https://devXXXXX.service-now.com
SERVICENOW_USERNAME=admin
SERVICENOW_PASSWORD=your_password
SERVICENOW_FETCH_LIMIT=500
```

4. Fetch data:
```bash
npm run fetch:servicenow    # Fetch real incidents
npm run generate:incidents  # Generate additional (AI)
npm run transform:incidents # Flatten structure
```

### Option 2: Use Existing Data
Data is already provided in `src/data/incidents.json` (2000 records)

---

## 🧠 Embeddings Configuration

### Mistral AI (Recommended - Free Tier)
```bash
EMBEDDINGS_PROVIDER=mistral
MISTRAL_API_KEY=your_key_here
MISTRAL_EMBEDDING_MODEL=mistral-embed
```

### OpenAI (Alternative)
```bash
EMBEDDINGS_PROVIDER=openai
OPENAI_API_KEY=your_key_here
```

Get API keys:
- **Mistral**: https://console.mistral.ai
- **OpenAI**: https://platform.openai.com

---

## 🧪 Testing

### Test MongoDB Connection
```bash
npm run test:mongodb
```

### Test Vector Search
```bash
npm run test:vector
```

### Test BM25 Search
```bash
npm run test:bm25
```

### Verify Indexes
```bash
npm run verify:bm25
```

---

## 🎯 Sample Queries

### Vector Search (Semantic)
- "VPN connection issues"
- "Database timeout problems"
- "Laptop won't turn on"

### BM25 Search (Keyword)
- "INC0000055"
- "Critical"
- "network"

### Hybrid Search (Combined)
- "SAP application not responding"
- "Email access problems"

---

## 📊 Features

### 1. **Query Preprocessing**
- ✅ IT abbreviation expansion (VPN → Virtual Private Network)
- ✅ Text normalization
- ✅ Stop word removal

### 2. **Search Types**
- ✅ **Vector Search**: Semantic similarity (1024D Mistral embeddings)
- ✅ **BM25 Search**: Keyword matching
- ✅ **Hybrid Search**: Combined (60% vector, 40% BM25)

### 3. **Advanced Filtering**
- ✅ Filter by: incidentId, category, status, priority
- ✅ Works with vector and hybrid search

### 4. **Weight Control**
- ✅ Adjustable vector/BM25 weights via UI sliders

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Test connection
npm run test:mongodb

# Check if cluster is paused in Atlas
# Resume cluster if needed
```

### BM25 Returns 0 Results
```bash
# Verify index exists
npm run verify:bm25

# Recreate index in MongoDB Atlas (see above)
```

### Port Already in Use
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000,3001 | xargs kill -9
```

---

## 📚 Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: React, Material-UI
- **LLM**: Groq (llama-3.3-70b-versatile)
- **Embeddings**: Mistral AI (mistral-embed, 1024D)
- **Vector Store**: MongoDB Atlas Vector Search
- **Framework**: LangChain
- **Search**: Hybrid (Vector + BM25)

---

## 📖 Additional Resources

- **MongoDB Index Configs**: `src/config/vectorindex.json`, `src/config/bm25index.json`
- **Sample Queries**: `SAMPLE_QUERIES.md` (200+ examples)
- **API Endpoints**: `TEST_ENDPOINTS.md`

---

## 🎉 Success Criteria

Your system is working when:
- ✅ Vector search finds similar incidents by meaning
- ✅ BM25 search finds exact keyword matches
- ✅ Hybrid search combines both effectively
- ✅ Filters work correctly
- ✅ All 2000 incidents are searchable
- ✅ UI loads at http://localhost:3000

---

**Need help? Check the logs or run diagnostic scripts above!** 🚀

