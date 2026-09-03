import React from 'react';
import { useApp } from '../context/AppContext';
import incuxaiHeroPoster from '../assets/incuxai_hero_poster.jpg';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Stack,
  Grid,
  Paper,
  Link
} from '@mui/material';

import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import Psychology from '@mui/icons-material/Psychology';
import AssignmentTurnedIn from '@mui/icons-material/AssignmentTurnedIn';
import Verified from '@mui/icons-material/Verified';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Twitter from '@mui/icons-material/Twitter';
import Instagram from '@mui/icons-material/Instagram';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2F3B8C',
      hover: '#242e70',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F6F4',
      paper: '#ffffff',
    },
    text: {
      primary: '#14161C',
      secondary: '#4B5563',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['Space Grotesk', 'Plus Jakarta Sans', 'Inter', 'sans-serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1.15,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export const HowItWorksPage = () => {
  const { navigateTo } = useApp();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F4', display: 'flex', flexDirection: 'column' }}>
        
        {/* NAVBAR */}
        <AppBar position="static" color="inherit" elevation={0} sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #E5E7EB' }}>
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ height: 72, justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
              <Box onClick={() => navigateTo('hero')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                <Box component="img" src={incuxaiHeroPoster} alt="JobRecipe Logo" sx={{ width: 36, height: 36, borderRadius: 2, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#14161C', fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.25rem' }}>
                    JobRecipe
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.6875rem' }}>
                    Job Readiness Platform
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button onClick={() => navigateTo('hero')} startIcon={<ArrowBack />} sx={{ color: '#4B5563', fontWeight: 600 }}>
                  Back to Home
                </Button>
                <Button variant="contained" onClick={() => navigateTo('signup')} sx={{ bgcolor: '#2F3B8C', py: 1, px: 2.5, fontWeight: 700 }}>
                  Get Started
                </Button>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* CONTENT */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, flex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.25rem', sm: '3.25rem' }, color: '#14161C', mb: 2 }}>
              How JobRecipe Works
            </Typography>
            <Typography variant="body1" sx={{ color: '#4B5563', fontSize: '1.125rem', maxWidth: 640, mx: 'auto' }}>
              A 3-step AI-driven methodology engineered by IncuxAI to turn your skills into verified recruiter-ready reports.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 8 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E5E7EB', height: '100%' }}>
                <Box sx={{ w: 48, h: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#eff6ff', color: '#2F3B8C', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <Psychology sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: '#14161C' }}>
                  1. AI Skill Gap Audit
                </Typography>
                <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6 }}>
                  Diagnose technical and logical skill gaps across engineering, software, and domain-specific roles in under 15 minutes.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E5E7EB', height: '100%' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#eff6ff', color: '#2F3B8C', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <AssignmentTurnedIn sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: '#14161C' }}>
                  2. Adaptive Assessment
                </Typography>
                <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6 }}>
                  Complete dynamic, anti-cheating role-based modules with real-time proctoring and non-repeating question sampling.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E5E7EB', height: '100%' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#eff6ff', color: '#2F3B8C', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <Verified sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: '#14161C' }}>
                  3. Verified Recruiter Report
                </Typography>
                <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6 }}>
                  Generate a verified competency score card shared directly with corporate hiring drives and talent recruiters.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', pt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigateTo('signup')}
              endIcon={<ArrowForward />}
              sx={{ bgcolor: '#2F3B8C', py: 1.75, px: 4, fontSize: '1rem', fontWeight: 700 }}
            >
              Start Free Assessment Now
            </Button>
          </Box>
        </Container>

        {/* FOOTER */}
        <Box sx={{ bgcolor: '#ffffff', borderTop: '1px solid #E5E7EB', py: 3, mt: 'auto' }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2, px: { xs: 2, sm: 4 } }}>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                © 2026 JobRecipe by IncuxAI. All rights reserved.
              </Typography>
              <Stack direction="row" spacing={2.5} sx={{ color: '#6B7280' }}>
                <Link href="https://linkedin.com" target="_blank" rel="noopener" sx={{ color: '#6B7280', '&:hover': { color: '#2F3B8C' } }}>
                  <LinkedIn sx={{ fontSize: 20 }} />
                </Link>
                <Link href="https://twitter.com" target="_blank" rel="noopener" sx={{ color: '#6B7280', '&:hover': { color: '#2F3B8C' } }}>
                  <Twitter sx={{ fontSize: 20 }} />
                </Link>
                <Link href="https://instagram.com" target="_blank" rel="noopener" sx={{ color: '#6B7280', '&:hover': { color: '#2F3B8C' } }}>
                  <Instagram sx={{ fontSize: 20 }} />
                </Link>
              </Stack>
            </Box>
          </Container>
        </Box>

      </Box>
    </ThemeProvider>
  );
};
