import React, { useState, useEffect } from 'react';
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
  Divider
} from '@mui/material';
import { Save as SaveIcon, Info as InfoIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  const [envVars, setEnvVars] = useState({
    MONGODB_URI: 'mongodb+srv://...',
    DB_NAME: 'incidents_rag',
    INCIDENTS_COLLECTION: 'incidents',
    VECTOR_INDEX_NAME: 'incident_vector_index',
    BM25_INDEX_NAME: 'incident_bm25_index',
    EMBEDDINGS_PROVIDER: 'mistral',
    MODEL_PROVIDER: 'groq',
    MAX_RESULTS: '10'
  });

  const handleSave = async () => {
    enqueueSnackbar('Settings are read-only. Configure via .env file.', { variant: 'info' });
  };

  const handleChange = (key, value) => {
    setEnvVars(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        ⚙️ Settings
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
        <Typography variant="body2">
          <strong>Note:</strong> Settings are configured via environment variables in the <code>.env</code> file. 
          Changes here are for display only. Restart the server after modifying the .env file.
        </Typography>
      </Alert>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          🗄️ MongoDB Configuration
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="MongoDB URI"
              value={envVars.MONGODB_URI}
              onChange={(e) => handleChange('MONGODB_URI', e.target.value)}
              type="password"
              disabled
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Database Name"
              value={envVars.DB_NAME}
              onChange={(e) => handleChange('DB_NAME', e.target.value)}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Incidents Collection"
              value={envVars.INCIDENTS_COLLECTION}
              onChange={(e) => handleChange('INCIDENTS_COLLECTION', e.target.value)}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Max Results"
              type="number"
              value={envVars.MAX_RESULTS}
              onChange={(e) => handleChange('MAX_RESULTS', e.target.value)}
              disabled
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          🔍 Search Configuration
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vector Index Name"
              value={envVars.VECTOR_INDEX_NAME}
              onChange={(e) => handleChange('VECTOR_INDEX_NAME', e.target.value)}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="BM25 Index Name"
              value={envVars.BM25_INDEX_NAME}
              onChange={(e) => handleChange('BM25_INDEX_NAME', e.target.value)}
              disabled
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          🤖 AI Configuration
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Embeddings Provider"
              value={envVars.EMBEDDINGS_PROVIDER}
              onChange={(e) => handleChange('EMBEDDINGS_PROVIDER', e.target.value)}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Model Provider"
              value={envVars.MODEL_PROVIDER}
              onChange={(e) => handleChange('MODEL_PROVIDER', e.target.value)}
              disabled
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          Save Settings (Read Only)
        </Button>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 System Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Backend Status
                </Typography>
                <Typography variant="h6" color="success.main">
                  ● Connected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Database
                </Typography>
                <Typography variant="h6">
                  MongoDB Atlas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Version
                </Typography>
                <Typography variant="h6">
                  v1.0.0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

