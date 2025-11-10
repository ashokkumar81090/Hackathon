# API Testing Guide

## Prerequisites
- MongoDB indexes created and Active
- Server running: `npm run dev`
- Server accessible at: `http://localhost:3001`

---

## 1. Health Check

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "mongodb": "connected",
    "vectorStore": "ready"
  }
}
```

---

## 2. Get Statistics

```bash
curl http://localhost:3001/api/stats
```

**Expected Response:**
```json
{
  "totalIncidents": 1500,
  "databaseSize": "XX MB",
  "configuration": {
    "embeddingsProvider": "mistral",
    "embeddingsModel": "mistral-embed",
    "embeddingsDimensions": 1024,
    "llmProvider": "groq",
    "llmModel": "llama-3.3-70b-versatile"
  }
}
```

---

## 3. Vector Search (Semantic)

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "database connection timeout",
    "searchMethod": "vector",
    "topK": 3
  }'
```

**Expected:** Returns incidents semantically similar to "database connection timeout"

---

## 4. Keyword Search (BM25)

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "memory error crash",
    "searchMethod": "keyword",
    "topK": 3
  }'
```

**Expected:** Returns incidents with exact keyword matches

---

## 5. Hybrid Search (Best Results)

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "application fails to start",
    "searchMethod": "hybrid",
    "topK": 5
  }'
```

**Expected:** Returns combined results from vector + keyword search

---

## 6. RAG Query (AI-Powered Answer)

```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I fix database connection timeout during peak hours?",
    "searchMethod": "hybrid",
    "topK": 5
  }'
```

**Expected Response:**
```json
{
  "query": "How do I fix database connection timeout...",
  "answer": "Based on similar incidents, here are the recommended steps:\n1. Increase connection pool size...\n2. Optimize queries...\n3. Implement connection timeout...",
  "relevantIncidents": [
    {
      "incidentId": "INC-XXX",
      "summary": "...",
      "score": 0.95,
      "matchType": "hybrid"
    }
  ],
  "metadata": {
    "searchMethod": "hybrid",
    "processingTime": 1234,
    "model": "groq/llama-3.3-70b-versatile"
  }
}
```

---

## 7. Test Different Query Types

### Technical Query
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What causes memory leaks in the application?",
    "searchMethod": "hybrid",
    "topK": 5
  }'
```

### Troubleshooting Query
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Users cannot log in - what should I check?",
    "searchMethod": "hybrid",
    "topK": 5
  }'
```

### Resolution Steps Query
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me how to fix email notification issues",
    "searchMethod": "hybrid",
    "topK": 5
  }'
```

---

## Search Method Comparison

| Method | When to Use | Strengths |
|--------|-------------|-----------|
| **vector** | Natural language queries | Understanding meaning, synonyms |
| **keyword** | Exact terms, IDs | Precise matches, known terms |
| **hybrid** | General use (recommended) | Best of both worlds |

---

## Troubleshooting

### No Results Returned
- ✅ Check indexes are "Active" in MongoDB Atlas
- ✅ Verify data is ingested: `curl http://localhost:3001/api/stats`
- ✅ Check index dimensions match (1024 for Mistral)

### Vector Search Returns 0 Results
- ❌ Vector index not created or wrong dimensions
- ❌ Index not synced yet (wait 2-5 minutes)

### Keyword Search Returns 0 Results
- ❌ BM25 index not created
- ❌ Wrong index type (must be "Atlas Search" not "Vector Search")

### Server Won't Start
- ❌ Missing environment variables (check `.env`)
- ❌ MongoDB connection issue
- ❌ API keys invalid

---

## Testing with Postman/Insomnia

Import this collection structure:

**Base URL**: `http://localhost:3001`

**Endpoints:**
1. `GET /health`
2. `GET /api/stats`
3. `POST /api/search` (with JSON body)
4. `POST /api/query` (with JSON body)

**Sample JSON Body for Search:**
```json
{
  "query": "your search query here",
  "searchMethod": "hybrid",
  "topK": 5
}
```

---

## Expected Performance

- **Search**: 100-300ms
- **RAG Query**: 1-3 seconds (depends on LLM)
- **Vector Generation**: ~2 seconds per incident during ingestion

---

## Success Criteria

✅ Health endpoint returns "healthy"  
✅ Stats show 1500 incidents  
✅ Vector search returns relevant results  
✅ Keyword search returns matching results  
✅ Hybrid search combines both effectively  
✅ RAG queries return coherent AI-generated answers  

---

## Next Steps After Testing

1. **Integrate into your application** - Use the API endpoints
2. **Customize prompts** - Edit `src/lib/prompts/incidentPrompts.ts`
3. **Adjust search weights** - Tune `HYBRID_VECTOR_WEIGHT` and `HYBRID_KEYWORD_WEIGHT` in `.env`
4. **Monitor performance** - Check response times and accuracy
5. **Add more data** - Ingest additional incidents as needed

Happy testing! 🚀

