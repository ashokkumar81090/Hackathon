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
  Insights as InsightsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';

export default function BM25Search() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
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
        searchType: 'keyword',  // Backend expects 'keyword' for BM25 search
        topK: limit
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
        🔤 BM25 Search
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
              Keyword-Based BM25 Search
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              BM25 (Best Matching 25) is a keyword-based ranking function that finds incidents based on exact term matches. Ideal for precise keyword searches and compliance requests.
            </Typography>
          </Box>

          {/* Query Input Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              What incident are you looking for?
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., server restart failed, database timeout, network connectivity issues..."
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
              We will search using BM25 algorithm to find incidents with exact keyword matches.
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

