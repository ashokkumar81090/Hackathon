# ⚡ Quick Start Guide

Get up and running with the Incident RAG System in **5 minutes**!

---

## 🚀 Quick Setup (5 Steps)

### 1️⃣ Install Dependencies

```bash
cd /Users/mohakh-blrm24/RAG-MONGO-POLIGER-Langchain
npm install
```

### 2️⃣ Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required
MONGODB_URI=your-mongodb-atlas-uri
OPENAI_API_KEY=your-openai-key
GROQ_API_KEY=your-groq-key
```

### 3️⃣ Prepare Data

Copy the example data:

```bash
cp src/data/incidents.example.json src/data/incidents.json
```

Or add your own incidents data to `src/data/incidents.json`.

### 4️⃣ Create MongoDB Indexes

View index configuration:

```bash
npm run create-index
```

Then create both indexes in MongoDB Atlas:
- Vector Search Index: `incidents_vector_index`
- BM25 Search Index: `incidents_bm25_index`

### 5️⃣ Ingest & Run

```bash
# Ingest data
npm run ingest

# Start server
npm run dev
```

---

## 🎯 Test the System

### Test Search

```bash
npm run test:search
```

### Test via API

```bash
# Search for incidents
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Application crashes", "searchType": "hybrid"}'

# Get AI answer
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How to fix database timeouts?"}'
```

---

## 📋 Commands Cheat Sheet

```bash
# Development
npm run dev              # Start with auto-reload
npm run build            # Build for production
npm start                # Run production build

# Data Management
npm run ingest           # Ingest incidents
npm run ingest:clear     # Clear and re-ingest

# Testing
npm run test:search      # Test search functionality

# Utilities
npm run create-index     # Show index configs
npm run typecheck        # Check TypeScript
```

---

## 🐛 Troubleshooting

### Problem: "No incidents found"

**Solution:**
1. Check data file exists: `ls src/data/incidents.json`
2. Run ingestion: `npm run ingest`
3. Verify: `curl http://localhost:3001/api/stats`

### Problem: "Vector index not found"

**Solution:**
1. Create indexes in MongoDB Atlas (see step 4 above)
2. Wait 2-3 minutes for indexes to build
3. Verify index status in Atlas UI

### Problem: "Embedding generation failed"

**Solution:**
1. Check `OPENAI_API_KEY` in `.env`
2. Verify OpenAI API quota
3. Check network connectivity

---

## 🎓 Next Steps

1. **Add your own incidents** to `src/data/incidents.json`
2. **Customize prompts** in `src/lib/prompts/incidentPrompts.ts`
3. **Adjust hybrid weights** in `.env`:
   ```env
   HYBRID_VECTOR_WEIGHT=0.6
   HYBRID_KEYWORD_WEIGHT=0.4
   ```
4. **Switch LLM provider** in `.env`:
   ```env
   MODEL_PROVIDER=anthropic  # openai, groq, anthropic
   ```

---

## 📚 Resources

- [Full README](./README.md) - Complete documentation
- [Comparison Guide](./COMPARISON.md) - LangChain vs From-Scratch
- [LangChain Docs](https://js.langchain.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 💡 Pro Tips

1. **Use Groq for faster responses** - Free tier is generous
2. **Start with hybrid search** - Best balance of accuracy
3. **Monitor MongoDB Atlas** - Watch for index build status
4. **Test with example data** - Before adding your own data
5. **Check logs** - Server logs show detailed pipeline execution

---

**Ready to build?** 🚀

```bash
npm run dev
```

Visit `http://localhost:3001/health` to verify everything is running!

