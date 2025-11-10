# 🔍 Sample RAG Queries - Test Your System

## 📋 Overview

These sample queries are designed to test your RAG system with the 2000 diverse incidents. They cover different categories, priorities, and search patterns.

---

## 🎯 Quick Test Queries (Start Here!)

### Simple Searches
```
1. "SAP application not accessible"
2. "Database connection timeout"
3. "VPN connection failure"
4. "Network connectivity issues"
5. "Email server down"
```

### Priority-Based Queries
```
6. "Critical incidents affecting production"
7. "High priority database issues"
8. "Low priority requests"
9. "What are the most urgent incidents?"
10. "Show me critical security incidents"
```

### Status-Based Queries
```
11. "What incidents are currently in progress?"
12. "Show resolved database issues"
13. "New incidents reported today"
14. "Closed security incidents"
15. "Incidents on hold waiting for approval"
```

---

## 💻 Software & Application Issues

### General Software
```
16. "Application crashes frequently"
17. "Software installation failed"
18. "Cannot login to application"
19. "Software performance is slow"
20. "Application freezing when opening files"
```

### SAP-Related
```
21. "SAP Sales application not responding"
22. "SAP HR module cannot be accessed"
23. "SAP Financial Accounting down"
24. "SAP Controlling application issues"
25. "SAP Materials Management slow performance"
```

### Cloud Applications
```
26. "Salesforce dashboard not loading"
27. "Teams meeting not starting"
28. "Zoom connection drops"
29. "SharePoint access denied"
30. "Outlook not syncing emails"
```

---

## 🖥️ Hardware Issues

### Desktop/Laptop
```
31. "Laptop not powering on"
32. "Desktop overheating issues"
33. "Monitor displaying no signal"
34. "Keyboard keys not working"
35. "Mouse cursor freezing"
```

### Peripherals
```
36. "Printer not printing documents"
37. "Scanner not detected by computer"
38. "Headset audio not working"
39. "Docking station connection issues"
40. "Webcam not recognized"
```

### Servers
```
41. "Server hardware failure detected"
42. "Production server making unusual noise"
43. "Server overheating temperature high"
44. "Need replacement server hardware"
45. "Server memory upgrade required"
```

---

## 🌐 Network Issues

### Connectivity
```
46. "No WiFi signal in conference room"
47. "Ethernet connection intermittent"
48. "Cannot connect to network drive"
49. "Network drops every few minutes"
50. "Slow network speed affecting work"
```

### VPN Issues
```
51. "VPN disconnects frequently"
52. "Cannot establish VPN connection"
53. "VPN authentication failed"
54. "Remote access via VPN not working"
55. "VPN client shows error message"
```

### Network Resources
```
56. "Cannot access file server"
57. "Print server unavailable"
58. "Shared drive not accessible"
59. "Network path not found error"
60. "DNS resolution failing"
```

---

## 💾 Database Issues

### Performance
```
61. "Database queries running very slow"
62. "PostgreSQL performance degradation"
63. "MySQL server response time increased"
64. "MongoDB connection timeout"
65. "Oracle database bottleneck issues"
```

### Connectivity
```
66. "Cannot connect to production database"
67. "Database authentication failed"
68. "Connection pool exhausted"
69. "Database server not responding"
70. "Redis cache connection refused"
```

### Data Issues
```
71. "Data corruption detected in table"
72. "Database backup failed last night"
73. "Missing records in database"
74. "Duplicate entries in database table"
75. "Database replication lag issues"
```

---

## 🔒 Security Issues

### Access & Authentication
```
76. "Account locked after failed login attempts"
77. "User lacks required permissions"
78. "Cannot access secure folder"
79. "Password reset not working"
80. "Two-factor authentication issues"
```

### Security Threats
```
81. "Suspicious login activity detected"
82. "Potential malware found on system"
83. "Unusual network traffic from IP address"
84. "Security certificate expired"
85. "Phishing email reported by user"
```

### Compliance
```
86. "Need access rights for compliance audit"
87. "SSL certificate renewal required"
88. "Security policy violation detected"
89. "Unauthorized access attempt logged"
90. "Encryption key rotation needed"
```

---

## ☁️ Cloud Service Issues

### AWS
```
91. "AWS S3 bucket not accessible"
92. "EC2 instance not responding"
93. "Lambda function timeout errors"
94. "CloudFront distribution issues"
95. "RDS database connection failed"
```

### Azure
```
96. "Azure Active Directory sync failing"
97. "Azure VM performance degraded"
98. "Blob storage access denied"
99. "Azure DevOps pipeline failing"
100. "Function App returning errors"
```

### Google Cloud
```
101. "Google Workspace email not syncing"
102. "Drive file sharing permissions issue"
103. "Cloud Storage upload failing"
104. "Compute Engine instance down"
105. "BigQuery query timeout"
```

---

## 📧 Email & Communication

### Email Issues
```
106. "Cannot send or receive emails"
107. "Email attachments not downloading"
108. "Inbox not syncing with server"
109. "Out of office reply not working"
110. "Email stuck in outbox"
```

### Communication Tools
```
111. "Teams chat messages not delivering"
112. "Slack notifications not working"
113. "Zoom screen sharing not functioning"
114. "Webex meeting audio problems"
115. "Video conference call quality poor"
```

---

## 🎫 Complex & Natural Language Queries

### Problem Description
```
116. "Users reporting they cannot access the SAP application since this morning"
117. "Multiple employees experiencing slow network speeds in Building A"
118. "Printer on floor 3 is making strange noises and not printing"
119. "Database is timing out when running reports during peak hours"
120. "VPN keeps disconnecting every 10 minutes for remote workers"
```

### Question Format
```
121. "Why is my laptop running so slow?"
122. "How do I fix email connection issues?"
123. "What causes database connection timeouts?"
124. "How long does it take to replace a server?"
125. "What steps are needed to resolve network outages?"
```

### Troubleshooting
```
126. "I tried restarting but the application still crashes"
127. "Password reset completed but still cannot login"
128. "Installed latest updates but printer still not working"
129. "Cleared cache but website still loading slowly"
130. "Replaced cable but network connection still dropping"
```

---

## 🎯 Filter-Based Searches (Use Vector Search Filters)

### By Priority
```
131. Query: "database issues"
    Filter: priority = "Critical"

132. Query: "network problems"
    Filter: priority = "High"

133. Query: "software bugs"
    Filter: priority = "Medium"
```

### By Status
```
134. Query: "security incidents"
    Filter: status = "In Progress"

135. Query: "hardware failures"
    Filter: status = "Resolved"

136. Query: "application errors"
    Filter: status = "New"
```

### By Category
```
137. Query: "performance issues"
    Filter: category = "Database"

138. Query: "access problems"
    Filter: category = "Security"

139. Query: "connection failures"
    Filter: category = "Network"
```

### Multiple Filters
```
140. Query: "server issues"
    Filters: {
      priority: "Critical",
      status: "In Progress",
      category: "Infrastructure"
    }
```

---

## 🔬 Advanced Queries

### Performance Issues
```
141. "Application takes more than 5 minutes to load"
142. "System response time degraded by 200%"
143. "Queries executing slower than normal baseline"
144. "CPU usage consistently above 90%"
145. "Memory consumption increasing over time"
```

### Infrastructure
```
146. "Production environment outage affecting users"
147. "Staging server configuration issues"
148. "Load balancer not distributing traffic"
149. "Firewall blocking legitimate traffic"
150. "DNS server returning incorrect addresses"
```

### Integration Issues
```
151. "API gateway returning 503 errors"
152. "Webhook notifications not being delivered"
153. "SSO authentication loop detected"
154. "Data sync between systems failing"
155. "Third-party service integration broken"
```

---

## 🆘 Emergency & Critical Queries

### Production Issues
```
156. "Production database is down"
157. "Critical system outage affecting all users"
158. "Payment processing system not working"
159. "Customer-facing website unavailable"
160. "Authentication service completely offline"
```

### Data Loss
```
161. "Important files accidentally deleted"
162. "Database records missing after update"
163. "Backup restoration failed"
164. "Data corruption after server crash"
165. "Lost access to critical documents"
```

### Security Emergencies
```
166. "Potential data breach detected"
167. "Ransomware attack suspected"
168. "Unauthorized admin access logged"
169. "Confidential data exposed publicly"
170. "DDoS attack in progress"
```

---

## 📊 Trend & Analytics Queries

### Pattern Recognition
```
171. "What are the most common network issues?"
172. "Show me recurring database problems"
173. "Which applications crash most frequently?"
174. "What hardware failures occur most often?"
175. "What are typical VPN connection issues?"
```

### Resolution Patterns
```
176. "How are SAP application issues typically resolved?"
177. "What steps fix database timeout problems?"
178. "How long do network outages usually take to fix?"
179. "What's the standard resolution for printer issues?"
180. "How are security incidents typically handled?"
```

---

## 🎭 User Perspective Queries

### End User Language
```
181. "My computer is frozen and won't respond"
182. "Internet stopped working on my laptop"
183. "Can't print anything from my workstation"
184. "Email is not working properly today"
185. "System keeps asking me to restart"
```

### Vague Descriptions
```
186. "Something is wrong with the application"
187. "Computer is acting weird lately"
188. "System is slower than usual"
189. "Getting error messages all the time"
190. "Things aren't working like they should"
```

---

## 🌟 Expected Results Test

### Should Find Relevant Incidents
```
191. "Oracle database" → Should find Oracle-related database issues
192. "Exchange server" → Should find email/Exchange server incidents
193. "WiFi problems" → Should find wireless network issues
194. "Laptop battery" → Should find laptop hardware issues
195. "Cloud service outage" → Should find AWS/Azure/GCP issues
```

### Should Use Context
```
196. "Can't log in" → Should find authentication/access issues
197. "Running slow" → Should find performance issues
198. "Not responding" → Should find application/system crashes
199. "Access denied" → Should find permission/security issues
200. "Connection failed" → Should find network/database connectivity
```

---

## 🧪 Testing Strategy

### 1. Start Simple
Test queries 1-15 to verify basic functionality

### 2. Test Categories
Try queries from each category (Software, Hardware, Network, etc.)

### 3. Test Filters
Use queries 131-140 with Vector Search filters

### 4. Test Complexity
Progress from simple to complex queries

### 5. Test Natural Language
Use queries 116-125 to test conversational understanding

### 6. Compare Search Methods
- Try same query with **Vector Search**
- Try same query with **BM25 Search**
- Try same query with **Hybrid Search**
- Compare results and relevance

---

## 📈 Expected Behavior

### Good Results Should:
✅ Return 3-5 highly relevant incidents
✅ Match the query intent and context
✅ Include similar issues even with different wording
✅ Show diverse priority levels
✅ Include resolution steps when available

### Poor Results Might:
❌ Return completely unrelated incidents
❌ Miss obvious keyword matches
❌ Show only one priority level
❌ Ignore important query terms
❌ Return incidents from wrong category

---

## 🎯 Pro Tips

1. **Use Filters**: Narrow results with priority/status/category filters
2. **Be Specific**: "SAP Sales application timeout" > "application issue"
3. **Try Synonyms**: Test different ways to describe the same problem
4. **Use Natural Language**: The RAG system understands conversational queries
5. **Compare Methods**: Vector search finds semantically similar, BM25 finds exact matches

---

## 🚀 Quick Test Script

Run these 5 queries to verify everything works:

```
1. "Database connection timeout" (Database)
2. "VPN keeps disconnecting" (Network)
3. "SAP application not accessible" (Software)
4. "Printer not working" (Hardware)
5. "Critical security incidents" (Security with priority)
```

If all 5 return relevant results, your RAG system is working perfectly! 🎉

---

## 💡 Need More Queries?

The beauty of RAG is that you can ask questions in natural language. Try:
- Describing your actual IT problems
- Asking how to fix specific issues
- Requesting resolution steps
- Asking about similar past incidents

**Your RAG system is now a knowledgeable IT assistant with 2000 diverse incidents!** 🚀

