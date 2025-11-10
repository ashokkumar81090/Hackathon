import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  AttachMoney as CostIcon,
  DataUsage as TokenIcon,
  Tune as TuneIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';

export default function RAGPipeline() {
  const [query, setQuery] = useState('');
  const [searchMethod, setSearchMethod] = useState('hybrid');
  const [limit, setLimit] = useState(10);
  const [preprocessQuery, setPreprocessQuery] = useState(true);
  const [vectorWeight, setVectorWeight] = useState(0.6);
  const [bm25Weight, setBm25Weight] = useState(0.4);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleSearch = async () => {
    if (!query.trim()) {
      enqueueSnackbar('Please enter a search query', { variant: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/query', {
        query,
        searchType: searchMethod,
        topK: limit
      });

      const result = response.data.success ? response.data.data : response.data;
      setResults(result);
      
      if (result.relevantIncidents && result.relevantIncidents.length > 0) {
        enqueueSnackbar(`Found ${result.relevantIncidents.length} results`, { variant: 'success' });
      } else {
        enqueueSnackbar('No results found', { variant: 'info' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      enqueueSnackbar(`Search failed: ${errorMsg}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        🚀 Complete RAG Pipeline
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
              Ask about your incidents
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Describe symptoms, impacted services, error codes, or KB IDs. Press Enter to search instantly.
            </Typography>
          </Box>

          {/* Query Input Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              What incident are you looking for?
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Application crashes on startup, Network connectivity issues, Database timeout errors..."
              multiline
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2, mr: 1 }}>
                    <SearchIcon sx={{ color: 'primary.main' }} />
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

          {/* Search Configuration */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
              Search Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <TuneIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Search Method
                    </Typography>
                  </Stack>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select search type</InputLabel>
                    <Select
                      value={searchMethod}
                      label="Select search type"
                      onChange={(e) => setSearchMethod(e.target.value)}
                    >
                      <MenuItem value="hybrid">Hybrid (BM25 + Vector)</MenuItem>
                      <MenuItem value="vector">Vector Search</MenuItem>
                      <MenuItem value="keyword">BM25 Search</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary', lineHeight: 1.5 }}>
                    Hybrid balances semantic relevance with exact keyword matches for best results.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <InsightsIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Results Limit
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    type="number"
                    label="Number of results"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: 1, max: 50 }
                    }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary', lineHeight: 1.5 }}>
                    Fetch up to 50 incidents per query for deeper investigations.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Query Refinement
                    </Typography>
                  </Stack>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: preprocessQuery ? 'primary.main' : 'divider',
                      backgroundColor: preprocessQuery ? 'action.selected' : 'transparent'
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Switch
                        checked={preprocessQuery}
                        onChange={(e) => setPreprocessQuery(e.target.checked)}
                        color="primary"
                        sx={{ mt: -0.5 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: 'text.primary' }}>
                          {preprocessQuery ? 'Refinement Enabled' : 'Refinement Disabled'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 1 }}>
                          Expand with synonyms, normalize phrasing, and strip noise automatically.
                        </Typography>
                        <Chip
                          label={preprocessQuery ? 'Active' : 'Inactive'}
                          color={preprocessQuery ? 'success' : 'default'}
                          size="small"
                          variant={preprocessQuery ? 'filled' : 'outlined'}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Weight Sliders for Hybrid Search */}
          {searchMethod === 'hybrid' && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                Hybrid Search Weighting
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2
                }}
              >
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          Vector Search Weight
                        </Typography>
                        <Chip label={`${(vectorWeight * 100).toFixed(0)}%`} color="primary" size="medium" />
                      </Stack>
                      <Slider
                        value={vectorWeight}
                        onChange={(e, v) => {
                          setVectorWeight(v);
                          setBm25Weight(1 - v);
                        }}
                        min={0}
                        max={1}
                        step={0.1}
                        marks={[
                          { value: 0, label: '0%' },
                          { value: 0.5, label: '50%' },
                          { value: 1, label: '100%' }
                        ]}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                        color="primary"
                        sx={{ mt: 2 }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
                        Emphasizes semantic meaning and context
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          BM25 Keyword Weight
                        </Typography>
                        <Chip label={`${(bm25Weight * 100).toFixed(0)}%`} color="secondary" size="medium" />
                      </Stack>
                      <Slider
                        value={bm25Weight}
                        onChange={(e, v) => {
                          setBm25Weight(v);
                          setVectorWeight(1 - v);
                        }}
                        min={0}
                        max={1}
                        step={0.1}
                        marks={[
                          { value: 0, label: '0%' },
                          { value: 0.5, label: '50%' },
                          { value: 1, label: '100%' }
                        ]}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                        color="secondary"
                        sx={{ mt: 2 }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
                        Focuses on exact keyword matches
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}

          {/* Search Button */}
          <Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              {loading ? 'Searching...' : 'Search Incidents'}
            </Button>
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary', lineHeight: 1.6 }}>
              We will fetch incidents, consolidate context, and surface the most relevant matches.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Box>
          {/* AI Generated Answer - Hidden by user request */}
          {/* {results.answer && (
            <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🤖 AI Generated Answer
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {results.answer}
              </Typography>
            </Paper>
          )} */}

          {/* Pipeline Metadata */}
          {results.metadata && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Pipeline Metadata
              </Typography>
              <Grid container spacing={2}>
                {results.metadata.processingTime && (
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TimeIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Processing Time
                          </Typography>
                        </Box>
                        <Typography variant="h6">
                          {results.metadata.processingTime}ms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {results.metadata.cost !== undefined && (
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CostIcon color="secondary" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            API Cost
                          </Typography>
                        </Box>
                        <Typography variant="h6">
                          ${(results.metadata.cost || 0).toFixed(6)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {results.metadata.tokens && (
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TokenIcon color="info" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Tokens Used
                          </Typography>
                        </Box>
                        <Typography variant="h6">
                          {results.metadata.tokens}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {results.metadata.searchType && (
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SearchIcon color="success" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Method
                          </Typography>
                        </Box>
                        <Typography variant="h6">
                          {results.metadata.searchType === 'keyword' ? 'BM25' : results.metadata.searchType.toUpperCase()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          {/* Search Results */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📄 Relevant Incidents
              <Chip label={results.relevantIncidents?.length || 0} color="primary" size="small" />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Expand an incident card to review full context, resolution steps, and owners.
            </Typography>
          </Stack>

          {results.relevantIncidents && results.relevantIncidents.length > 0 ? (
            results.relevantIncidents.map((item, index) => {
              // Handle both nested (item.incident) and flat structures
              const incident = item.incident || item;
              const score = item.score;
              
              return (
                <Accordion
                  key={index}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(79,70,229,0.35)' : 'rgba(79,70,229,0.2)'}`,
                    overflow: 'hidden',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(39,39,68,0.85) 0%, rgba(17,24,39,0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(248,250,255,0.92) 0%, rgba(228,233,255,0.92) 100%)'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { md: 'center' },
                        gap: 1.5,
                        width: '100%'
                      },
                      px: { xs: 2, md: 3 },
                      py: { xs: 1.5, md: 2 }
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {incident.incidentId || `Incident ${index + 1}`}
                      </Typography>
                      {(incident.summary || incident.description) && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            maxWidth: 680,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {incident.summary || incident.description}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {incident.priority && (
                        <Chip
                          label={incident.priority}
                          size="small"
                          color={
                            incident.priority === 'High' || incident.priority === 'Critical'
                              ? 'error'
                              : incident.priority === 'Medium'
                              ? 'warning'
                              : 'success'
                          }
                        />
                      )}
                      {incident.status && (
                        <Chip label={incident.status} size="small" variant="outlined" />
                      )}
                      {score !== undefined && (
                        <Tooltip title="Hybrid relevance score">
                          <Chip label={`Score ${score.toFixed(3)}`} size="small" color="primary" variant="outlined" />
                        </Tooltip>
                      )}
                      {incident.category && (
                        <Chip label={incident.category} size="small" color="info" variant="outlined" />
                      )}
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                    <Stack spacing={2.5}>
                      {/* Summary */}
                      {incident.summary && (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" color="primary">
                            Summary
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {incident.summary}
                          </Typography>
                        </Stack>
                      )}
                      
                      {/* Description */}
                      {incident.description && (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" color="primary">
                            Description
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {incident.description}
                          </Typography>
                        </Stack>
                      )}
                      
                      {/* Category */}
                      {incident.category && (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" color="primary">
                            Category
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {incident.category}
                          </Typography>
                        </Stack>
                      )}
                      
                      {/* Resolution Steps */}
                      {incident.resolutionSteps && (
                        <Stack spacing={1.5}>
                          <Divider />
                          <Typography variant="subtitle2" color="success.main">
                            Resolution Steps
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {incident.resolutionSteps}
                          </Typography>
                        </Stack>
                      )}
                      
                      {/* Root Cause */}
                      {incident.rootCause && (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" color="warning.main">
                            Root Cause
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {incident.rootCause}
                          </Typography>
                        </Stack>
                      )}

                      {/* Additional Metadata */}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        {incident.assignee && (
                          <Chip label={`Assignee • ${incident.assignee}`} size="small" variant="outlined" />
                        )}
                        {incident.team && (
                          <Chip label={incident.team} size="small" color="secondary" variant="outlined" />
                        )}
                        {incident.createdDate && (
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(incident.createdDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {incident.resolvedDate && (
                          <Typography variant="caption" color="text.secondary">
                            Resolved: {new Date(incident.resolvedDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })
          ) : (
            <Alert severity="info">
              <Typography variant="body2">
                No results found. Try adjusting your search query or method.
              </Typography>
            </Alert>
          )}

          {/* IT Team Recommendations Section - Only show for hybrid search when recommendations exist */}
          {results && results.recommendations && searchMethod === 'hybrid' && (
            <Paper
              elevation={2}
              sx={{
                p: 4,
                mt: 4,
                borderRadius: 3,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)'
                    : 'linear-gradient(180deg, rgba(249,250,251,0.98) 0%, rgba(241,245,249,0.95) 100%)',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)'}`
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
                    🎯 IT Team Recommendations
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7, fontStyle: 'italic' }}>
                    {results.recommendations.summary}
                  </Typography>
                </Box>

                {/* Priority and Time Estimate */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Priority: ${results.recommendations.priority}`}
                    color={results.recommendations.priority === 'High' ? 'error' : results.recommendations.priority === 'Medium' ? 'warning' : 'success'}
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                {/* Key Resolution Steps */}
                {results.recommendations.keySteps && results.recommendations.keySteps.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
                      🔧 Key Resolution Steps
                    </Typography>
                    <List dense>
                      {results.recommendations.keySteps.map((step, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40, alignSelf: 'flex-start', mt: 0.5 }}>
                            <Paper
                              sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                borderRadius: '50%',
                                fontWeight: 700,
                                fontSize: '0.875rem'
                              }}
                            >
                              {index + 1}
                            </Paper>
                          </ListItemIcon>
                          <ListItemText
                            primary={step}
                            primaryTypographyProps={{
                              sx: {
                                color: 'text.primary',
                                lineHeight: 1.7,
                                fontWeight: 400
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Best Practices */}
                {results.recommendations.bestPractices && results.recommendations.bestPractices.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 600, mb: 2 }}>
                      ✨ Best Practices
                    </Typography>
                    <List dense>
                      {results.recommendations.bestPractices.map((practice, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40, alignSelf: 'flex-start', mt: 0.5 }}>
                            <Paper
                              sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'success.main',
                                color: 'success.contrastText',
                                borderRadius: '50%',
                                fontSize: '1.2rem'
                              }}
                            >
                              ✓
                            </Paper>
                          </ListItemIcon>
                          <ListItemText
                            primary={practice}
                            primaryTypographyProps={{
                              sx: {
                                color: 'text.primary',
                                lineHeight: 1.7,
                                fontWeight: 400
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Preventive Measures */}
                {results.recommendations.preventiveMeasures && results.recommendations.preventiveMeasures.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: 'warning.main', fontWeight: 600, mb: 2 }}>
                      🛡️ Preventive Measures
                    </Typography>
                    <List dense>
                      {results.recommendations.preventiveMeasures.map((measure, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40, alignSelf: 'flex-start', mt: 0.5 }}>
                            <Paper
                              sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'warning.main',
                                color: 'warning.contrastText',
                                borderRadius: '50%',
                                fontSize: '1rem'
                              }}
                            >
                              ⚠
                            </Paper>
                          </ListItemIcon>
                          <ListItemText
                            primary={measure}
                            primaryTypographyProps={{
                              sx: {
                                color: 'text.primary',
                                lineHeight: 1.7,
                                fontWeight: 400
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}
        </Box>
      )}

      {!results && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>How to use:</strong> Enter your question about IT incidents, select a search method, and click "EXECUTE RAG PIPELINE". 
            The system will use AI to find relevant incidents and generate a comprehensive answer.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
