import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { LoginRequest } from '../../models/types';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../context/ThemeContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Email e senha são obrigatórios');
      return;
    }

    try {
      const credentials: LoginRequest = { email, password };
      await login(credentials);
      navigate('/home');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setLocalError(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: (t) => t.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(59,130,246,0.08), transparent 10%), radial-gradient(circle at 90% 80%, rgba(124,58,237,0.06), transparent 15%)`,
          zIndex: 0,
        }}
      />

      <Container component="main" maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={12}
            sx={{
              position: 'relative',
              width: { xs: '100%', sm: 520 },
              borderRadius: 3,
              pt: 6,
              pb: 6,
              px: { xs: 3, sm: 6 },
              background: (t) => (t.palette.mode === 'dark' ? 'rgba(6,30,60,0.7)' : 'rgba(255,255,255,0.9)'),
              color: (t) => t.palette.text.primary,
              backdropFilter: 'blur(8px)',
              boxShadow: (t) => (t.palette.mode === 'dark' ? '0 30px 60px rgba(2,6,23,0.6)' : '0 20px 40px rgba(15,23,42,0.06)'),
            }}
          >
            <IconButton
              onClick={toggleMode}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.95)' : t.palette.primary.dark),
                background: (t) => (t.palette.mode === 'dark' ? 'transparent' : 'rgba(37,99,235,0.12)'),
                '&:hover': {
                  background: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(37,99,235,0.16)'),
                },
                borderRadius: 2,
                border: (t) => (t.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(37,99,235,0.16)'),
                boxShadow: (t) => (t.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(37,99,235,0.12)'),
              }}
              aria-label="toggle theme"
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700, color: (t) => t.palette.text.primary }}>
                Login
              </Typography>
              <Typography variant="body2" sx={{ color: (t) => t.palette.mode === 'dark' ? t.palette.text.secondary : 'rgba(15,23,42,0.72)' }}>
                Acesse sua conta
              </Typography>
            </Stack>

            {(error || localError) && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error || localError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </InputAdornment>
                  ),
                  inputProps: { style: { color: theme.palette.text.primary } },
                }}
                InputLabelProps={{ sx: { color: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(2,6,23,0.6)') } }}
                variant="filled"
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(2,6,23,0.06)'), borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={(t) => ({ color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(2,6,23,0.7)' })} />
                    </InputAdornment>
                  ),
                  inputProps: { style: { color: theme.palette.text.primary } },
                }}
                InputLabelProps={{ sx: { color: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(2,6,23,0.72)') } }}
                variant="filled"
              />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                <FormControlLabel
                  control={<Checkbox sx={(t) => ({ color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)' })} />}
                  label={<Typography sx={{ color: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.72)'), fontSize: 13 }}>Lembrar-me</Typography>}
                />
                <Button variant="text" sx={{ color: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.72)' : t.palette.primary.dark), textTransform: 'none' }}>
                  Esqueceu sua senha?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 1, py: 1.3, borderRadius: 3, background: 'linear-gradient(90deg,#2563eb,#60a5fa)' }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'LOGIN'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.72)') }}>
                  Novo aqui? <Button variant="text" onClick={() => navigate('/register')} sx={{ color: (t) => t.palette.primary.dark, textTransform: 'none' }}>Cadastre-se</Button>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>

      <Box
        component="img"
        src="/assets/wave.svg"
        alt="wave"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: { xs: 120, sm: 160 },
          objectFit: 'cover',
          opacity: 0.12,
          zIndex: 1,
        }}
      />
    </Box>
  );
};

export default Login;
