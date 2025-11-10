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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Stack
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ExpandMore as ExpandMoreIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';

export default function HybridSearch() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [bm25Weight, setBm25Weight] = useState(0.4);
  const [vectorWeight, setVectorWeight] = useState(0.6);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    incidentId: '',
    category: '',
    status: '',
    priority: ''
  });
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
      // Prepare filters - only include non-empty values
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value.trim() !== '')
      );

      // ALWAYS include Resolved and Closed status filter for hybrid search
      const hybridFilters = {
        ...activeFilters,
        status: 'Resolved' // This will be overridden by backend to include both Resolved and Closed
      };

      const response = await axios.post('/api/query', {
        query,
        searchType: 'hybrid',
        topK: limit,
        filters: hybridFilters // Always include filters for hybrid search
      });

      const result = response.data.success ? response.data.data : response.data;
      setResults(result);
      enqueueSnackbar(`Found ${result.relevantIncidents?.length || 0} resolved/closed results`, { variant: 'success' });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      enqueueSnackbar('Search failed', { variant: 'error' });
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
        ⚡ Hybrid Search (BM25 + Vector)
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Auto-Filter:</strong> Hybrid Search automatically shows only <strong>Resolved</strong> and <strong>Closed</strong> incidents with proven solutions.
      </Alert>

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
              Hybrid Relevance Engine
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Orchestrate BM25 and vector scoring with weight controls for precision + recall harmony. Combines both keyword-based (BM25) and semantic (vector) search for optimal results. Automatically shows only Resolved and Closed incidents with proven solutions.
            </Typography>
          </Box>

          {/* Query Input Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              What incident are you looking for?
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., memory leak in production, database timeout errors, network connectivity issues..."
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
              <Grid item xs={12} md={6}>
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
            </Grid>
          </Box>

          {/* Hybrid Search Weighting */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
              Hybrid Search Weighting
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
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

      {/* Advanced Filters */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            🔍 Advanced Filters (Optional)
            {(filters.incidentId || filters.category || filters.priority) &&
              <Chip label="Active" color="primary" size="small" sx={{ ml: 2 }} />
            }
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Additional filters are applied to the vector search component of hybrid search to narrow down results.
              <strong> Status is automatically filtered to show only Resolved and Closed incidents.</strong>
            </Typography>
            
            <Grid container spacing={3}>
              {/* Incident ID */}
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Incident ID
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g., INC100000"
                    value={filters.incidentId}
                    onChange={(e) => setFilters({ ...filters, incidentId: e.target.value })}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Filter by specific incident ID
                  </Typography>
                </Box>
              </Grid>
              
              {/* Category */}
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Category
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    SelectProps={{ native: true }}
                    size="small"
                  >
                    <option value="">All Categories</option>
                    <option value="Software Bug">Software Bug</option>
                    <option value="Hardware Issue">Hardware Issue</option>
                    <option value="Network Issue">Network Issue</option>
                    <option value="Cloud Service Outage">Cloud Service Outage</option>
                    <option value="Security Incident">Security Incident</option>
                    <option value="Performance Issue">Performance Issue</option>
                    <option value="Network Connectivity">Network Connectivity</option>
                    <option value="Software Installation">Software Installation</option>
                    <option value="Hardware Failure">Hardware Failure</option>
                    <option value="VPN Issue">VPN Issue</option>
                    <option value="Email Access">Email Access</option>
                    <option value="System Crash">System Crash</option>
                    <option value="Password/Access">Password/Access</option>
                    <option value="Printer Issue">Printer Issue</option>
                    <option value="Active Directory">Active Directory</option>
                    <option value="Laptop Issue">Laptop Issue</option>
                  </TextField>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Filter by incident category
                  </Typography>
                </Box>
              </Grid>
              
              {/* Status - Auto-filtered for hybrid search */}
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Status
                  </Typography>
                  <TextField
                    fullWidth
                    value="Auto: Resolved/Closed"
                    size="small"
                    disabled
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                        fontWeight: 'bold'
                      }
                    }}
                  />
                  <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: 'block', fontWeight: 'bold' }}>
                    ✓ Automatically applied
                  </Typography>
                </Box>
              </Grid>
              
              {/* Priority */}
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Priority
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    SelectProps={{ native: true }}
                    size="small"
                  >
                    <option value="">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </TextField>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Filter by incident priority
                  </Typography>
                </Box>
              </Grid>
              
              {/* Clear Button */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFilters({ incidentId: '', category: '', status: '', priority: '' })}
                  disabled={!filters.incidentId && !filters.category && !filters.priority}
                >
                  Clear Additional Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>


      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              {results && results.relevantIncidents && results.relevantIncidents.map((item, index) => {
                const incident = item.incident || item;
                const score = item.score;

                return (
                  <Accordion key={index} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', pr: 2 }}>
                        <Typography>{incident.incidentId || `Result ${index + 1}`}</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip label={`Score: ${score?.toFixed(3)}`} size="small" color="primary" />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph><strong>Summary:</strong> {incident.summary}</Typography>
                      <Typography variant="body2" paragraph><strong>Description:</strong> {incident.description}</Typography>
                      {incident.resolutionSteps && (
                        <Typography variant="body2" paragraph><strong>Resolution:</strong> {incident.resolutionSteps}</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}

              {/* IT Team Recommendations Section */}
              {results && results.recommendations && (
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
  );
}

