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
  InputAdornment,
  Stack
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';

export default function VectorSearch() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  
  // Filter states
  const [filters, setFilters] = useState({
    incidentId: '',
    category: '',
    status: '',
    priority: ''
  });

  const handleSearch = async () => {
    if (!query.trim()) {
      enqueueSnackbar('Please enter a search query', { variant: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Build filters object, excluding empty values
      const activeFilters = {};
      if (filters.incidentId) activeFilters.incidentId = filters.incidentId;
      if (filters.category) activeFilters.category = filters.category;
      if (filters.status) activeFilters.status = filters.status;
      if (filters.priority) activeFilters.priority = filters.priority;

      const response = await axios.post('/api/query', {
        query,
        searchType: 'vector',
        topK: limit,
        filters: Object.keys(activeFilters).length > 0 ? activeFilters : undefined
      });

      const result = response.data.success ? response.data.data : response.data;
      setResults(result);
      enqueueSnackbar(`Found ${result.relevantIncidents?.length || 0} results`, { variant: 'success' });
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
        🧠 Vector Search
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
              Semantic Vector Search
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Search incidents using semantic embeddings to find matches based on meaning rather than exact keyword matches. Perfect for finding similar issues even with different wording.
            </Typography>
          </Box>

          {/* Query Input Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              What incident are you looking for?
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Database connection timeout, Network connectivity issues, Application crashes..."
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

          {/* Advanced Filters */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Advanced Filters (Optional)
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TuneIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Filter Options
                  </Typography>
                  {(filters.incidentId || filters.category || filters.status || filters.priority) && (
                    <Chip 
                      label="Active" 
                      size="small" 
                      color="primary" 
                    />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ pt: 2 }}>
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
                          variant="outlined"
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
                          variant="outlined"
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
                    
                    {/* Status */}
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                          Status
                        </Typography>
                        <TextField
                          fullWidth
                          select
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          SelectProps={{ native: true }}
                          size="small"
                          variant="outlined"
                        >
                          <option value="">All Statuses</option>
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </TextField>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Filter by incident status
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
                          variant="outlined"
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
                        disabled={!filters.incidentId && !filters.category && !filters.status && !filters.priority}
                      >
                        Clear All Filters
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>
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
              We will search using semantic embeddings to find the most relevant incidents based on meaning.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {results && results.relevantIncidents && results.relevantIncidents.map((item, index) => {
        const incident = item.incident || item;
        const score = item.score;
        
        return (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', pr: 2 }}>
                <Typography>{incident.incidentId || `Result ${index + 1}`}</Typography>
                <Chip label={`Score: ${score?.toFixed(3)}`} size="small" color="primary" />
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
    </Box>
  );
}

