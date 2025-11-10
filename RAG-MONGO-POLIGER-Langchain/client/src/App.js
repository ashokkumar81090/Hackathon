import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Container,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  useMediaQuery,
  Collapse,
  Switch,
  FormControlLabel,
  Fade,
  Grid,
  Paper,
  Stack,
  Chip,
  Avatar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  NavigateNext as NavigateNextIcon,
  TextFields as KeywordIcon,
  AutoFixHigh as HybridIcon,
  Psychology as PreprocessIcon,
  BugReport as IncidentIcon
} from '@mui/icons-material';
import { SnackbarProvider } from 'notistack';

// Import components
import VectorSearch from './components/VectorSearch';
import BM25Search from './components/BM25Search';
import HybridSearch from './components/HybridSearch';
import RAGPipeline from './components/RAGPipeline';
import QueryPreprocessing from './components/QueryPreprocessing';
import Settings from './components/Settings';

// Enterprise color palette
const createEnterpriseTheme = (mode) => {
  const base = createTheme();

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#4F46E5',
        light: '#6366F1',
        dark: '#312E81',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#F97316',
        light: '#FB923C',
        dark: '#C2410C',
        contrastText: '#111827'
      },
      info: {
        main: '#22D3EE'
      },
      success: {
        main: '#34D399'
      },
      background: {
        default: mode === 'light' ? '#F3F4F6' : '#0B0B11',
        paper: mode === 'light' ? '#ffffff' : '#161622'
      },
      text: {
        primary: mode === 'light' ? '#0F172A' : '#F9FAFB',
        secondary: mode === 'light' ? '#6B7280' : '#94A3B8'
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        fontSize: '2.2rem',
        lineHeight: 1.2,
        letterSpacing: '-0.03em'
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.3
      },
      body1: {
        lineHeight: 1.6
      }
    },
    shape: {
      borderRadius: 14
    },
    shadows: mode === 'light'
      ? base.shadows.map((shadow, index) => (index > 1 ? '0 20px 45px rgba(79, 70, 229, 0.08)' : shadow))
      : base.shadows,
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            backdropFilter: 'blur(10px)',
            backgroundImage: mode === 'light'
              ? 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0.9) 100%)'
              : 'linear-gradient(180deg, rgba(49,46,129,0.45) 0%, rgba(12,10,29,0.92) 100%)',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)'
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            margin: '4px 12px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: 4,
              borderRadius: 999,
              background: 'transparent',
              transition: 'background 0.3s ease'
            },
            '&.Mui-selected::before': {
              background: '#F97316'
            },
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.24)'
            },
            '&.Mui-selected': {
              backgroundColor: mode === 'light' ? 'rgba(79,70,229,0.12)' : 'rgba(79,70,229,0.32)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 18
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
            letterSpacing: '0.04em'
          }
        }
      }
    }
  });
};

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

const menuItems = [
  { 
    id: 'rag', 
    label: 'RAG Pipeline', 
    icon: <IncidentIcon />, 
    component: RAGPipeline,
    description: 'Complete RAG pipeline for incidents'
  },
  { 
    id: 'preprocess', 
    label: 'Query Preprocessing', 
    icon: <PreprocessIcon />, 
    component: QueryPreprocessing,
    description: 'Transform & expand queries'
  },
  { 
    id: 'vector', 
    label: 'Vector Search', 
    icon: <SearchIcon />, 
    component: VectorSearch,
    description: 'Semantic vector search'
  },
  { 
    id: 'bm25', 
    label: 'BM25 Search', 
    icon: <KeywordIcon />, 
    component: BM25Search,
    description: 'Keyword-based search'
  },
  { 
    id: 'hybrid', 
    label: 'Hybrid Search', 
    icon: <HybridIcon />, 
    component: HybridSearch,
    description: 'Combined BM25 + Vector'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <SettingsIcon />, 
    component: Settings,
    description: 'Configure environment'
  },
];

const heroContent = {
  rag: {
    title: 'Incident Intelligence Hub',
    subtitle: 'Blend semantic and keyword discovery to surface the most relevant incident knowledge instantly.',
    caption: 'Powered by hybrid vector + BM25 retrieval layered on LangChain orchestration.',
    metrics: [
      { label: 'Average Response', value: '3.2h', trend: '+12% vs last month', color: 'primary.main' },
      { label: 'Knowledge Coverage', value: '12k+', trend: 'Curated incident records', color: 'secondary.main' },
      { label: 'Automation Savings', value: '38%', trend: 'Manual triage reduced', color: 'success.main' }
    ]
  },
  preprocess: {
    title: 'Intelligent Query Preprocessing',
    subtitle: 'Normalize, expand, and sanitize input to boost retrieval accuracy without manual tuning.',
    caption: 'Includes semantic rewrites, synonyms, and priority cues for downstream search.',
    metrics: [
      { label: 'Rewrites Per Query', value: '4.2', trend: 'Average augmentations', color: 'info.main' },
      { label: 'Noise Reduction', value: '67%', trend: 'Irrelevant tokens trimmed', color: 'secondary.main' },
      { label: 'Precision Lift', value: '1.6x', trend: 'Higher match rate', color: 'success.main' }
    ]
  },
  vector: {
    title: 'Semantic Vector Search',
    subtitle: 'Embedding-driven recall finds semantically similar incidents across thousands of records.',
    caption: 'Uses MongoDB Atlas Vector Search backed by OpenAI embeddings.',
    metrics: [
      { label: 'Vectors Indexed', value: '9.4k', trend: 'Across 28 categories', color: 'primary.main' },
      { label: 'Latency (p95)', value: '210ms', trend: 'End-to-end retrieval', color: 'info.main' },
      { label: 'Relevance Boost', value: '2.1x', trend: 'Vs keyword baseline', color: 'success.main' }
    ]
  },
  bm25: {
    title: 'Precision Keyword Retrieval',
    subtitle: 'Classic BM25 matching optimized for IT incident language and legacy logs.',
    caption: 'Ideal for exact match scenarios, compliance requests, and audit trails.',
    metrics: [
      { label: 'Keyword Libraries', value: '450+', trend: 'Domain-specific terms', color: 'secondary.main' },
      { label: 'Median Recall', value: '88%', trend: 'Across historical data', color: 'primary.main' },
      { label: 'Noise Filtered', value: '73%', trend: 'Stop-word suppression', color: 'info.main' }
    ]
  },
  hybrid: {
    title: 'Hybrid Relevance Engine',
    subtitle: 'Orchestrate BM25 and vector scoring with weight controls for precision + recall harmony.',
    caption: 'Adaptive scoring ensures critical incidents never slip through.',
    metrics: [
      { label: 'Dual-Mode Wins', value: '94%', trend: 'Queries resolved faster', color: 'primary.main' },
      { label: 'Confidence Scores', value: '0.87', trend: 'Average hybrid score', color: 'secondary.main' },
      { label: 'Analyst Satisfaction', value: '4.8/5', trend: 'Internal feedback', color: 'success.main' }
    ]
  },
  settings: {
    title: 'Operational Controls & Telemetry',
    subtitle: 'Configure providers, thresholds, and credentials with confidence and transparency.',
    caption: 'Everything is auditable and ready for enterprise rollout.',
    metrics: [
      { label: 'Managed Environments', value: '6', trend: 'Prod + regional staging', color: 'primary.main' },
      { label: 'API Integrations', value: '14', trend: 'Plug-and-play adapters', color: 'info.main' },
      { label: 'Health Checks', value: '24/7', trend: 'Automated observability', color: 'secondary.main' }
    ]
  }
};

function App() {
  const [selectedMenuItem, setSelectedMenuItem] = useState('rag');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // Always default to dark mode

  const isMobile = useMediaQuery('(max-width:768px)');
  const theme = createEnterpriseTheme(darkMode ? 'dark' : 'light');

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const getCurrentComponent = () => {
    const menuItem = menuItems.find(item => item.id === selectedMenuItem);
    const Component = menuItem?.component;
    return Component ? <Component /> : <div>Select a menu item</div>;
  };

  const getCurrentMenuItem = () => {
    return menuItems.find(item => item.id === selectedMenuItem);
  };

  const currentHero = heroContent[selectedMenuItem] || heroContent.rag;

  const actualDrawerWidth = drawerOpen ? drawerWidth : collapsedDrawerWidth;

  const topBarGradient = darkMode
    ? 'linear-gradient(90deg, rgba(99,102,241,0.75) 0%, rgba(14,116,144,0.7) 100%)'
    : 'linear-gradient(90deg, rgba(99,102,241,0.92) 0%, rgba(14,165,233,0.85) 100%)';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        dense
        preventDuplicate
      >
        <Box sx={{ display: 'flex' }}>
          <AppBar
            position="fixed"
            elevation={0}
            sx={{
              width: { sm: `calc(100% - ${actualDrawerWidth}px)` },
              ml: { sm: `${actualDrawerWidth}px` },
              backgroundImage: topBarGradient,
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
              
              <DashboardIcon sx={{ mr: 2 }} />
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                Incidents RAG System
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={handleThemeToggle}
                    icon={<LightModeIcon />}
                    checkedIcon={<DarkModeIcon />}
                  />
                }
                label=""
                sx={{ mr: 1 }}
              />
            </Toolbar>
            
            <Toolbar
              variant="dense"
              sx={{
                minHeight: '52px !important',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(15,23,42,0.12)'
              }}
            >
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ color: 'primary.contrastText' }}
              >
                <Link
                  component="button"
                  variant="body2"
                  sx={{ 
                    color: 'inherit', 
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => setSelectedMenuItem('rag')}
                >
                  Home
                </Link>
                <Typography variant="body2" sx={{ color: 'primary.contrastText' }}>
                  {getCurrentMenuItem()?.label}
                </Typography>
              </Breadcrumbs>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Typography variant="caption" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                {getCurrentMenuItem()?.description}
              </Typography>
            </Toolbar>
          </AppBar>

          <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? drawerOpen : true}
            onClose={handleDrawerToggle}
            sx={{
              width: actualDrawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: actualDrawerWidth,
                boxSizing: 'border-box',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: 'hidden',
                borderRight: '1px solid rgba(255,255,255,0.06)'
              },
            }}
          >
            <Toolbar>
              <Fade in={drawerOpen} timeout={300}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main',
                      fontSize: '1.1rem'
                    }}
                  >
                    Navigation
                  </Typography>
                </Box>
              </Fade>
              {!drawerOpen && (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <DashboardIcon color="primary" />
                </Box>
              )}
            </Toolbar>
            
            <Divider />
            
            <List sx={{ pt: 2 }}>
              {menuItems.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <Tooltip 
                    title={drawerOpen ? '' : item.label} 
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      selected={selectedMenuItem === item.id}
                      onClick={() => setSelectedMenuItem(item.id)}
                      sx={{
                        minHeight: 48,
                        justifyContent: drawerOpen ? 'initial' : 'center',
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: drawerOpen ? 3 : 'auto',
                          justifyContent: 'center',
                          color: selectedMenuItem === item.id ? 'primary.main' : 'inherit'
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      
                      <Collapse in={drawerOpen} orientation="horizontal" timeout={300}>
                        <ListItemText
                          primary={item.label}
                          secondary={item.description}
                          primaryTypographyProps={{
                            fontSize: '0.95rem',
                            fontWeight: selectedMenuItem === item.id ? 600 : 500,
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.75rem',
                            color: 'text.secondary'
                          }}
                        />
                      </Collapse>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ mt: 'auto' }} />
            
            <Box sx={{ p: 2 }}>
              <Collapse in={drawerOpen} timeout={300}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Incidents RAG v1.0
                </Typography>
              </Collapse>
            </Box>
          </Drawer>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: 'background.default',
              p: { xs: 2, sm: 4 },
              minHeight: '100vh',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundImage: darkMode
                  ? 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 55%), radial-gradient(circle at 80% 10%, rgba(14,165,233,0.18), transparent 50%)'
                  : 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.22), transparent 60%), radial-gradient(circle at 80% 5%, rgba(14,165,233,0.15), transparent 55%)',
                opacity: 0.9,
                pointerEvents: 'none'
              },
              '& > *': {
                position: 'relative',
                zIndex: 1
              },
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Toolbar />
            <Toolbar variant="dense" />
            
            <Container maxWidth={false} sx={{ mt: 2, px: { xs: 1, sm: 0 } }}>
              <Fade in timeout={500}>
                <Stack spacing={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 5 },
                      backgroundImage: darkMode
                        ? 'linear-gradient(135deg, rgba(63,63,221,0.54) 0%, rgba(14,165,233,0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(129,140,248,0.85) 0%, rgba(56,189,248,0.75) 100%)',
                      color: 'primary.contrastText',
                      border: '1px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 25px 50px -12px rgba(30,64,175,0.45)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.35), transparent 45%)',
                        opacity: 0.6
                      }}
                    />
                    <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                      <Grid item xs={12} md={7}>
                        <Stack spacing={2}>
                          <Chip
                            label={getCurrentMenuItem()?.label || 'Experience'}
                            sx={{
                              alignSelf: 'flex-start',
                              bgcolor: 'rgba(255,255,255,0.16)',
                              color: '#fff',
                              fontWeight: 600,
                              letterSpacing: '0.05em'
                            }}
                          />
                          <Typography variant="h4" sx={{ maxWidth: 520 }}>
                            {currentHero.title}
                          </Typography>
                          <Typography variant="body1" sx={{ maxWidth: 540, opacity: 0.92 }}>
                            {currentHero.subtitle}
                          </Typography>
                          <Typography variant="body2" sx={{ maxWidth: 480, opacity: 0.75 }}>
                            {currentHero.caption}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Grid container spacing={2}>
                          {currentHero.metrics.map((metric, index) => (
                            <Grid item xs={12} sm={6} key={metric.label}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  height: '100%',
                                  backgroundColor: 'rgba(255,255,255,0.16)',
                                  color: '#fff',
                                  borderRadius: 3,
                                  border: '1px solid rgba(255,255,255,0.18)'
                                }}
                              >
                                <Stack spacing={1.5}>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: metric.color,
                                      boxShadow: '0 12px 24px rgba(15,23,42,0.25)'
                                    }}
                                  >
                                    {index + 1}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="h6" sx={{ color: '#fff' }}>
                                      {metric.value}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                                      {metric.label}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                                    {metric.trend}
                                  </Typography>
                                </Stack>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Box>
                    {getCurrentComponent()}
                  </Box>
                </Stack>
              </Fade>
            </Container>
          </Box>
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
