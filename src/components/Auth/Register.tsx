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
  IconButton,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../../context/ThemeContext';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const Register: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || !confirmPassword) {
      setLocalError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('As senhas não coincidem.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.register({ nome, email, password });
      navigate('/home');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar';
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (t) => t.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper sx={{ position: 'relative', p: { xs: 3, sm: 5 }, borderRadius: 3, boxShadow: 3, background: (t) => (t.palette.mode === 'dark' ? 'rgba(6,30,60,0.7)' : 'rgba(255,255,255,0.95)'), color: (t) => t.palette.text.primary }}>
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

          <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
              Criar conta
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Registre-se para acessar o sistema GearOne
            </Typography>
          </Stack>

          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              label="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(2,6,23,0.04)'), borderRadius: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(2,6,23,0.04)'), borderRadius: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(2,6,23,0.04)'), borderRadius: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(2,6,23,0.04)'), borderRadius: 1 }}
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} /> : 'Criar conta'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="text" onClick={() => navigate('/login')}>
              Já tenho conta
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
