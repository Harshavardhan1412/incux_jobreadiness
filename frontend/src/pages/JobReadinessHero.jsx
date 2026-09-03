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
  Link
} from '@mui/material';

import ArrowForward from '@mui/icons-material/ArrowForward';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Twitter from '@mui/icons-material/Twitter';
import Instagram from '@mui/icons-material/Instagram';

// Custom MUI Theme Matching IncuxAI Indigo Brand Palette
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2F3B8C', // Signature Indigo Accent Color (#2F3B8C)
      hover: '#242e70',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F6F4', // Light cool-gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#14161C', // Dark Ink (#14161C)
      secondary: '#4B5563', // Muted Gray
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#2F3B8C',
          '&:hover': {
            backgroundColor: '#242e70',
          },
        },
      },
    },
  },
});

export const JobReadinessHero = () => {
  const { navigateTo } = useApp();

  const handleGetStarted = () => {
    // Links directly to Candidate Sign Up page
    navigateTo('signup');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* LIGHT COOL-GRAY BACKGROUND (#F5F6F4) */}
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F5F6F4',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        {/* 1. NAVBAR WITH OFFICIAL INCUXAI LOGO PHOTO */}
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: '#ffffff',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ height: 72, justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
              
              {/* Left Side: IncuxAI Brand Logo Photo & Wordmark */}
              <Box
                onClick={() => navigateTo('hero')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {/* Official IncuxAI Uploaded Logo Photo */}
                <Box
                  component="img"
                  src={incuxaiHeroPoster}
                  alt="IncuxAI Logo"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    objectFit: 'cover',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                  }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: 800,
                      color: '#14161C',
                      lineHeight: 1.1,
                      fontFamily: '"Space Grotesk", "Plus Jakarta Sans", "Inter", sans-serif',
                      fontSize: '1.25rem',
                    }}
                  >
                    IncuxAI
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.6875rem', fontWeight: 500 }}>
                    Job Readiness Platform
                  </Typography>
                </Box>
              </Box>

              {/* Far Right: 'Sign in', 'Sign up', & 'Admin Portal' */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  onClick={() => navigateTo('login')}
                  sx={{
                    color: '#14161C',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 1.5,
                    minWidth: 'auto',
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: '#2F3B8C',
                    },
                  }}
                >
                  Candidate Login
                </Button>

                <Button
                  variant="contained"
                  onClick={() => navigateTo('signup')}
                  sx={{
                    bgcolor: '#2F3B8C',
                    color: '#ffffff',
                    py: 1,
                    px: 2.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: '#242e70',
                    },
                  }}
                >
                  Sign up
                </Button>

                <Button
                  onClick={() => navigateTo('admin')}
                  sx={{
                    color: '#4B5563',
                    border: '1px solid #D1D5DB',
                    py: 0.8,
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    '&:hover': {
                      bgcolor: '#F3F4F6',
                      color: '#111827',
                      borderColor: '#9CA3AF',
                    },
                  }}
                >
                  Admin Portal
                </Button>
              </Box>

            </Toolbar>
          </Container>
        </AppBar>

        {/* 2. HERO: CENTERED SINGLE COLUMN WITH COMPACT ELEGANT INCUXAI BRAND BADGE */}
        <Container
          maxWidth="md"
          sx={{
            py: { xs: 6, md: 10 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >

          {/* COMPACT & SLEEK INCUXAI BRAND PHOTO BADGE */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              p: 0.75,
              pr: 2.25,
              bgcolor: '#ffffff',
              border: '1px solid #E5E7EB',
              borderRadius: 99,
              mb: 3.5,
              boxShadow: '0 4px 14px rgba(47, 59, 140, 0.08)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 18px rgba(47, 59, 140, 0.12)',
              },
            }}
          >
            <Box
              component="img"
              src={incuxaiHeroPoster}
              alt="IncuxAI Logo"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 99,
                objectFit: 'cover',
                border: '1.5px solid #2F3B8C',
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#14161C', fontSize: '0.8125rem' }}>
              IncuxAI Job Readiness Engine
            </Typography>
          </Box>

          {/* Bold Headline in Dark Ink (#14161C) */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
              fontWeight: 800,
              color: '#14161C',
              maxWidth: 680,
              mb: 3,
              lineHeight: 1.15,
            }}
          >
            Know exactly what stands between you and your next job.
          </Typography>

          {/* Short Gray Paragraph */}
          <Typography
            variant="body1"
            sx={{
              color: '#4B5563',
              fontSize: { xs: '1rem', sm: '1.0625rem' },
              lineHeight: 1.6,
              maxWidth: 620,
              mb: 4,
            }}
          >
            <Box component="span" sx={{ fontWeight: 800, color: '#14161C' }}>IncuxAI</Box> diagnoses your skill gaps, walks you through role-based assessments, and turns the results into a verified report recruiters can act on.
          </Typography>

          {/* Two Centered CTA Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems="center"
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            {/* Solid Indigo 'Get started' with Right Arrow Icon */}
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: '#2F3B8C',
                color: '#ffffff',
                py: 1.5,
                px: 3.5,
                fontSize: '0.9375rem',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#242e70',
                },
              }}
            >
              Get started
            </Button>

            {/* Plain Text 'See how it works' Link */}
            <Button
              onClick={handleGetStarted}
              sx={{
                color: '#14161C',
                fontWeight: 700,
                fontSize: '0.9375rem',
                p: 1,
                '&:hover': {
                  bgcolor: 'transparent',
                  color: '#2F3B8C',
                  textDecoration: 'underline',
                },
              }}
            >
              See how it works
            </Button>
          </Stack>

          {/* Three Short Trust Lines in a Horizontal Row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4 }}
            alignItems="center"
            justifyContent="center"
            sx={{ color: '#4B5563', fontSize: '0.875rem' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutlined sx={{ fontSize: 18, color: '#16a34a' }} />
              <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>
                Free skill audit, no card required
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutlined sx={{ fontSize: 18, color: '#16a34a' }} />
              <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>
                Results in minutes, not weeks
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutlined sx={{ fontSize: 18, color: '#16a34a' }} />
              <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>
                Reports verified before recruiters see them
              </Typography>
            </Box>
          </Stack>

        </Container>

        {/* 3. FOOTER: THIN TOP BORDER, PLAIN WHITE BACKGROUND */}
        <Box
          sx={{
            bgcolor: '#ffffff',
            borderTop: '1px solid #E5E7EB',
            py: 3,
            mt: 'auto',
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                px: { xs: 2, sm: 4 },
              }}
            >
              {/* Left: Copyright */}
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                © 2026 IncuxAI. All rights reserved.
              </Typography>

              {/* Right: Three Simple Outlined Social Icons (LinkedIn, Twitter, Instagram) */}
              <Stack direction="row" spacing={2.5} sx={{ color: '#6B7280' }}>
                <Link
                  href="https://linkedin.com/company/incuxai"
                  target="_blank"
                  rel="noopener"
                  sx={{ color: '#6B7280', '&:hover': { color: '#2F3B8C' } }}
                >
                  <LinkedIn sx={{ fontSize: 20 }} />
                </Link>
                <Link
                  href="https://twitter.com/incuxai"
                  target="_blank"
                  rel="noopener"
                  sx={{ color: '#6B7280', '&:hover': { color: '#2F3B8C' } }}
                >
                  <Twitter sx={{ fontSize: 20 }} />
                </Link>
                <Link
                  href="https://instagram.com/incuxai"
                  target="_blank"
                  rel="noopener"
                  sx={{ color: '#6B7280', '&:hover': { color: '#2F3B8C' } }}
                >
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
