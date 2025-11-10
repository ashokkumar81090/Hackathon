import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Stack
} from '@mui/material';
import { 
  Psychology as PreprocessIcon,
  ArrowForward as ArrowIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

export default function QueryPreprocessing() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Sample queries for demonstration
  const sampleQueries = [
    "DNS lookup failing for API calls",
    "VPN connection timeout on AWS EC2",
    "SQL injection vulnerability in REST API",
    "High CPU usage and RAM exhaustion",
    "SSL certificate expired on HTTPS endpoint",
    "MFA not working for SSO login"
  ];

  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'can', 'to', 'of', 'in', 'for',
    'with', 'when', 'how', 'what', 'where', 'why', 'i', 'me', 'my'
  ]);

  const abbreviations = {
    'DNS': 'Domain Name System',
    'VPN': 'Virtual Private Network',
    'API': 'Application Programming Interface',
    'REST': 'Representational State Transfer',
    'SQL': 'Structured Query Language',
    'CPU': 'Central Processing Unit',
    'RAM': 'Random Access Memory',
    'SSL': 'Secure Sockets Layer',
    'TLS': 'Transport Layer Security',
    'HTTPS': 'Hypertext Transfer Protocol Secure',
    'MFA': 'Multi-Factor Authentication',
    'SSO': 'Single Sign-On',
    'AWS': 'Amazon Web Services',
    'EC2': 'Elastic Compute Cloud',
    'S3': 'Simple Storage Service',
    'DB': 'Database',
    'HTTP': 'Hypertext Transfer Protocol',
    'FTP': 'File Transfer Protocol',
    'SMTP': 'Simple Mail Transfer Protocol',
    'IP': 'Internet Protocol',
    'TCP': 'Transmission Control Protocol',
    'UDP': 'User Datagram Protocol',
    'CORS': 'Cross-Origin Resource Sharing',
    'JSON': 'JavaScript Object Notation',
    'XML': 'Extensible Markup Language',
    'LDAP': 'Lightweight Directory Access Protocol',
    'SSH': 'Secure Shell',
    'SLA': 'Service Level Agreement',
    'ITIL': 'Information Technology Infrastructure Library',
  };

  const synonyms = {
    'app': ['application', 'software', 'program'],
    'crash': ['crash', 'failure', 'error', 'down'],
    'fix': ['resolve', 'repair', 'solve', 'correct'],
    'database': ['database', 'db', 'data store'],
    'login': ['login', 'signin', 'authentication', 'access'],
    'server': ['server', 'service', 'host'],
    'slow': ['slow', 'latency', 'performance issue', 'sluggish'],
    'error': ['error', 'exception', 'failure', 'issue'],
  };

  const handlePreprocess = async () => {
    if (!query.trim()) {
      enqueueSnackbar('Please enter a query', { variant: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 1: Original
      const original = query;

      // Step 2: Text Cleaning - Remove special characters and extra spaces
      const cleaned = query
        .replace(/[^\w\s'-]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Step 3: Normalization - Lowercase
      const normalized = cleaned.toLowerCase();

      // Step 4: Tokenization
      const tokens = normalized.split(/\s+/);

      // Step 5: Stop Word Removal
      const withoutStopWords = tokens.filter(word => !stopWords.has(word));

      // Step 6: Key Terms Extraction
      const keyTerms = withoutStopWords.filter(word => word.length > 2);

      // Step 7: Abbreviation Expansion
      const abbreviationsFound = [];
      let abbreviationExpanded = normalized;
      
      Object.keys(abbreviations).forEach(abbrev => {
        const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
        if (regex.test(normalized)) {
          abbreviationsFound.push({
            abbrev,
            expanded: abbreviations[abbrev]
          });
          // For search, add both forms
          abbreviationExpanded = abbreviationExpanded.replace(
            regex, 
            `${abbrev} ${abbreviations[abbrev]}`
          );
        }
      });

      // Step 8: Synonym Expansion
      const expandedTerms = new Set();
      keyTerms.forEach(term => {
        expandedTerms.add(term);
        if (synonyms[term]) {
          synonyms[term].forEach(syn => expandedTerms.add(syn));
        }
      });

      // Step 9: Final Query
      const finalQuery = keyTerms.join(' ');
      const expandedQuery = Array.from(expandedTerms).join(' OR ');

      // Step 9: Entity Extraction (simple version)
      const entities = {
        components: [],
        actions: [],
        issues: []
      };

      const componentKeywords = ['app', 'application', 'server', 'database', 'system', 'service'];
      const actionKeywords = ['fix', 'resolve', 'restart', 'configure', 'install', 'upload'];
      const issueKeywords = ['crash', 'error', 'timeout', 'failure', 'slow', 'down', 'leak'];

      keyTerms.forEach(term => {
        if (componentKeywords.includes(term)) entities.components.push(term);
        if (actionKeywords.includes(term)) entities.actions.push(term);
        if (issueKeywords.includes(term)) entities.issues.push(term);
      });

      setResults({
        original,
        cleaned,
        normalized,
        tokens,
        withoutStopWords,
        keyTerms,
        abbreviationsFound,
        abbreviationExpanded,
        finalQuery,
        expandedQuery,
        entities,
        tokenCount: tokens.length,
        keyTermCount: keyTerms.length,
        stopWordsRemoved: tokens.length - withoutStopWords.length,
        expansionRatio: (expandedTerms.size / keyTerms.length).toFixed(2)
      });
      
      enqueueSnackbar('Query preprocessed successfully!', { variant: 'success' });
    } catch (err) {
      setError(err.message);
      enqueueSnackbar('Preprocessing failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePreprocess();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        🧬 Query Preprocessing
      </Typography>

      <Paper
        elevation={2}
        sx={{
          p: { xs: 4, md: 5 },
          mb: 4,
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)'
              : 'linear-gradient(180deg, rgba(249,250,251,0.98) 0%, rgba(241,245,249,0.95) 100%)',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)'}`
        }}
      >
        <Stack spacing={4}>
          {/* Header Section */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
              Intelligent Query Preprocessing
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Transform raw user queries into optimized search queries. This improves retrieval accuracy by normalizing text, expanding IT abbreviations (DNS, API, SQL, etc.), removing noise, and enhancing with synonyms.
            </Typography>
          </Box>

          {/* Query Input Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Enter query to preprocess
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., APP CRASHED when uploading files!!!, DNS lookup failing for API calls, VPN connection timeout..."
              multiline
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2, mr: 1 }}>
                    <PreprocessIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: '1rem',
                  '& fieldset': {
                    borderWidth: 2,
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2
                  }
                }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  py: 2,
                  px: 1,
                  fontSize: '1rem',
                  lineHeight: 1.6
                },
                '& .MuiInputBase-inputMultiline': {
                  paddingTop: '20px',
                  paddingBottom: '20px'
                }
              }}
            />
          </Box>

          {/* Sample Queries */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
              Try these examples:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {sampleQueries.map((sample, idx) => (
                <Chip
                  key={idx}
                  label={sample}
                  onClick={() => setQuery(sample)}
                  clickable
                  size="small"
                  variant="outlined"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Preprocess Button */}
          <Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PreprocessIcon />}
              onClick={handlePreprocess}
              disabled={loading || !query.trim()}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              {loading ? 'Processing...' : 'Preprocess Query'}
            </Button>
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary', lineHeight: 1.6 }}>
              We will normalize, expand, and optimize your query for better search results.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {results && (
        <Box>
          {/* Processing Steps */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            🔄 Processing Steps
          </Typography>
          
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Step 1: Text Cleaning
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Remove special characters, extra spaces, and normalize punctuation
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Paper sx={{ p: 2, flex: 1, bgcolor: 'grey.100' }}>
                    <Typography variant="caption" color="text.secondary">Before:</Typography>
                    <Typography variant="body2">{results.original}</Typography>
                  </Paper>
                  <ArrowIcon color="primary" />
                  <Paper sx={{ p: 2, flex: 1, bgcolor: 'success.light' }}>
                    <Typography variant="caption" color="text.secondary">After:</Typography>
                    <Typography variant="body2">{results.cleaned}</Typography>
                  </Paper>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Step 2: Normalization
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Convert to lowercase for case-insensitive matching
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Paper sx={{ p: 2, flex: 1, bgcolor: 'grey.100' }}>
                    <Typography variant="caption" color="text.secondary">Before:</Typography>
                    <Typography variant="body2">{results.cleaned}</Typography>
                  </Paper>
                  <ArrowIcon color="primary" />
                  <Paper sx={{ p: 2, flex: 1, bgcolor: 'success.light' }}>
                    <Typography variant="caption" color="text.secondary">After:</Typography>
                    <Typography variant="body2">{results.normalized}</Typography>
                  </Paper>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 2, border: '2px solid', borderColor: 'secondary.main' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Step 3: IT Abbreviation Expansion ✨ NEW
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Automatically detect and expand IT industry abbreviations (DNS, API, SQL, etc.)
                </Typography>
                
                {results.abbreviationsFound && results.abbreviationsFound.length > 0 ? (
                  <>
                    <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Found {results.abbreviationsFound.length} abbreviation(s)!
                      </Typography>
                    </Alert>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {results.abbreviationsFound.map((item, idx) => (
                        <Grid item xs={12} md={6} key={idx}>
                          <Card variant="outlined" sx={{ bgcolor: 'info.light' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip 
                                  label={item.abbrev} 
                                  color="primary" 
                                  size="medium"
                                  sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                                />
                                <ArrowIcon color="primary" />
                                <Typography variant="body2" fontWeight="500">
                                  {item.expanded}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Search-Optimized (includes both forms):
                      </Typography>
                      <Paper sx={{ p: 2, mt: 1, bgcolor: 'success.light' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {results.abbreviationExpanded}
                        </Typography>
                      </Paper>
                    </Box>
                  </>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      No IT abbreviations found in this query. Try queries like "DNS timeout" or "API error".
                    </Typography>
                  </Alert>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Step 4: Tokenization & Stop Word Removal
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Split into words and remove common words that don't add meaning
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">All Tokens ({results.tokens.length}):</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {results.tokens.map((token, idx) => (
                        <Chip 
                          key={idx} 
                          label={token} 
                          size="small" 
                          color={stopWords.has(token) ? 'default' : 'primary'}
                          variant={stopWords.has(token) ? 'outlined' : 'filled'}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">After Removal ({results.keyTerms.length}):</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {results.keyTerms.map((term, idx) => (
                        <Chip 
                          key={idx} 
                          label={term} 
                          size="small" 
                          color="success"
                          icon={<CheckIcon />}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Step 5: Synonym Expansion
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add related terms to improve recall and find similar incidents
                </Typography>
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
                  <Typography variant="caption" color="text.secondary">Expanded Query:</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                    {results.expandedQuery}
                  </Typography>
                </Paper>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Step 6: Entity Extraction
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Identify key entities: components, actions, and issues
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {results.entities.components.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="primary">Components:</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            {results.entities.components.map((comp, idx) => (
                              <Chip key={idx} label={comp} size="small" color="primary" />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {results.entities.actions.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="secondary">Actions:</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            {results.entities.actions.map((action, idx) => (
                              <Chip key={idx} label={action} size="small" color="secondary" />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {results.entities.issues.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="error">Issues:</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            {results.entities.issues.map((issue, idx) => (
                              <Chip key={idx} label={issue} size="small" color="error" />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 3 }} />

          {/* Statistics */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            📊 Statistics
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Original Tokens
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {results.tokenCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Key Terms
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {results.keyTermCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Stop Words Removed
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {results.stopWordsRemoved}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Expansion Ratio
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {results.expansionRatio}x
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Final Output */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            ✅ Final Output
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: 'success.light' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Optimized Search Query:
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {results.finalQuery}
            </Typography>
          </Paper>

          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Impact:</strong> This preprocessed query will match more relevant incidents by removing noise, 
              normalizing text, and expanding with synonyms. Use this optimized query for better search results!
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
}
