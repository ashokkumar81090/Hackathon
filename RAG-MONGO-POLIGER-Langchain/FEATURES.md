# ✨ Features Guide - RAG System

## 📋 Table of Contents
1. [Query Preprocessing](#query-preprocessing)
2. [Vector Search with Filters](#vector-search-with-filters)
3. [Hybrid Search Weights](#hybrid-search-weights)
4. [Search Types Comparison](#search-types-comparison)

---

## 🔍 Query Preprocessing

### IT Abbreviation Expansion

The system automatically expands IT abbreviations for better search results.

**Examples:**
| Input | Expanded To |
|-------|-------------|
| VPN | Virtual Private Network |
| DNS | Domain Name System |
| API | Application Programming Interface |
| CPU | Central Processing Unit |
| RAM | Random Access Memory |
| SSD | Solid State Drive |
| SQL | Structured Query Language |
| HTTP | HyperText Transfer Protocol |

**Try It:**
- Search: "VPN issue" → Finds "Virtual Private Network" incidents
- Search: "DNS failure" → Finds "Domain Name System" issues
- Search: "API timeout" → Finds "Application Programming Interface" problems

### Other Preprocessing Steps

1. **Text Normalization**: Lowercase, trim whitespace
2. **Tokenization**: Split into meaningful words
3. **Stop Word Removal**: Remove common words (the, is, at)
4. **Synonym Expansion**: Handle similar terms

---

## 🎯 Vector Search with Filters

### Available Filters

Filter search results by:

1. **Incident ID**: Exact match (e.g., "INC0000055")
2. **Category**: Software, Hardware, Network, etc.
3. **Status**: Open, In Progress, Resolved, Closed
4. **Priority**: Critical, High, Medium, Low

### How to Use

**In UI:**
1. Go to "Vector Search" tab
2. Expand "Advanced Filters" section
3. Select filter values
4. Click "Search"

**Via API:**
```javascript
POST /api/query
{
  "query": "database timeout",
  "searchType": "vector",
  "topK": 10,
  "filters": {
    "priority": "Critical",
    "status": "Open"
  }
}
```

### Example Queries

**Find Critical Network Issues:**
- Query: "connection problems"
- Filters: Priority=Critical, Category=Network

**Find Resolved Database Incidents:**
- Query: "database"
- Filters: Status=Resolved

**Find Specific Incident:**
- Filters: incidentId=INC0000055

---

## ⚖️ Hybrid Search Weights

### What Are Weights?

Hybrid search combines:
- **Vector Search** (semantic similarity)
- **BM25 Search** (keyword matching)

Weights control the balance between them.

### Default Configuration

```
Vector Weight: 60%
BM25 Weight:   40%
```

### Adjusting Weights

**In UI:**
1. Go to "RAG Pipeline" tab
2. Find "Search Weight Distribution" sliders
3. Adjust:
   - **More Vector**: Better for semantic/meaning-based queries
   - **More BM25**: Better for exact keyword matches

**Sliders are linked:** Moving one automatically adjusts the other.

### When to Adjust

| Scenario | Recommended Weights | Why |
|----------|---------------------|-----|
| Natural language queries | 70% Vector, 30% BM25 | Better semantic understanding |
| Exact ID/keyword search | 30% Vector, 70% BM25 | Prioritize exact matches |
| Mixed queries | 50% Vector, 50% BM25 | Balanced approach |
| Technical terms | 60% Vector, 40% BM25 | Default (works well) |

---

## 🔬 Search Types Comparison

### 1. Vector Search (Semantic)

**How it Works:**
- Converts query to 1024D embedding
- Finds similar incidents by meaning
- Uses cosine similarity

**Best For:**
- Natural language questions
- Conceptual searches
- When exact keywords differ

**Examples:**
- "My laptop won't start" → Finds "Computer fails to boot"
- "Internet is down" → Finds "Network connectivity issues"
- "Can't access email" → Finds "Email server unavailable"

**Pros:**
- ✅ Understands context and meaning
- ✅ Works with synonyms
- ✅ Handles typos better

**Cons:**
- ❌ Slower than keyword search
- ❌ May miss exact matches

---

### 2. BM25 Search (Keyword)

**How it Works:**
- Tokenizes query into keywords
- Exact and fuzzy text matching
- BM25 ranking algorithm

**Best For:**
- Exact incident IDs
- Specific technical terms
- Known error messages

**Examples:**
- "INC0000055" → Exact incident match
- "Critical" → All critical priority incidents
- "ORA-12154" → Specific error code

**Pros:**
- ✅ Very fast
- ✅ Exact matches guaranteed
- ✅ Works well with IDs and codes

**Cons:**
- ❌ No semantic understanding
- ❌ Misses synonyms
- ❌ Sensitive to exact wording

---

### 3. Hybrid Search (Combined)

**How it Works:**
- Runs both Vector and BM25 searches
- Combines results with weighted scores
- Re-ranks for best matches

**Best For:**
- General purpose queries
- When you're not sure which is better
- Production use cases

**Examples:**
- "SAP application not responding" → Gets both semantic and exact matches
- "Critical network issues last week" → Combines meaning with keywords

**Pros:**
- ✅ Best of both worlds
- ✅ Balanced results
- ✅ Handles diverse query types

**Cons:**
- ❌ Slightly slower (runs both)
- ❌ More complex to tune

---

## 🎯 Choosing the Right Search Type

### Quick Decision Guide

```
Is it an exact ID or code?
  └─ YES → Use BM25 Search
  └─ NO → Continue

Is it a natural language question?
  └─ YES → Use Vector Search
  └─ NO → Continue

Not sure?
  └─ Use Hybrid Search (default)
```

### Performance Characteristics

| Metric | Vector | BM25 | Hybrid |
|--------|--------|------|--------|
| Speed | Medium | Fast | Medium |
| Accuracy | High (semantic) | High (exact) | Highest |
| Use Case | Meaning-based | Keyword-based | General |

---

## 📊 Real-World Examples

### Example 1: Help Desk Query

**User asks:** "Users can't log into the VPN"

**Recommended:** Hybrid Search
- **Why:** Combines "VPN" keyword matching with semantic understanding of "can't log in"
- **Result:** Finds VPN login issues, authentication failures, connection problems

### Example 2: Incident Lookup

**User asks:** "Show me INC0101234"

**Recommended:** BM25 Search
- **Why:** Exact incident ID lookup
- **Result:** Instantly returns that specific incident

### Example 3: Pattern Analysis

**User asks:** "What causes database timeouts?"

**Recommended:** Vector Search
- **Why:** Conceptual question about patterns
- **Result:** Finds incidents explaining various database timeout causes

---

## 🔧 API Examples

### Vector Search with Filters
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "network connectivity issues",
    "searchType": "vector",
    "topK": 5,
    "filters": {
      "priority": "Critical",
      "status": "Open"
    }
  }'
```

### BM25 Search
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "INC0000055",
    "searchType": "keyword",
    "topK": 10
  }'
```

### Hybrid Search (Default)
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SAP application problems",
    "searchType": "hybrid",
    "topK": 10
  }'
```

---

**Experiment with different search types and filters to find what works best for your use case!** 🚀

