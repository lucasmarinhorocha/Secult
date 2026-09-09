import React from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

// Configuração de cada bloco (Tile)
interface TileConfig {
  label: string;
  icon: React.ReactNode;
  path?: string;
  color: string;
  wide?: boolean; // Se verdadeiro, o bloco ocupa 2 colunas
  action?: 'logout'; // Define se o bloco tem uma ação especial
}

const tiles: TileConfig[] = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon sx={{ fontSize: 40 }} />,
    path: '/dashboard',
    color: '#0078D7', // Azul Windows
    wide: true,
  },
  {
    label: 'Insumos',
    icon: <Inventory2Icon sx={{ fontSize: 36 }} />,
    path: '/insumos',
    color: '#00A650', // Verde
  },
  {
    label: 'Ocorrências',
    icon: <BuildIcon sx={{ fontSize: 36 }} />,
    path: '/ocorrencias',
    color: '#E74C3C', // Vermelho
  },
  {
    label: 'Documentos',
    icon: <DescriptionIcon sx={{ fontSize: 36 }} />,
    path: '/documentos',
    color: '#F2A900', // Laranja
  },
  {
    label: 'Presença',
    icon: <QrCodeScannerIcon sx={{ fontSize: 40 }} />,
    path: '/presenca',
    color: '#8E44AD', // Roxo
    wide: true,
  },
  {
    label: 'Perfil',
    icon: <PersonIcon sx={{ fontSize: 36 }} />,
    path: '/perfil',
    color: '#00B7C3', // Ciano
  },
  {
    label: 'Sair',
    icon: <LogoutIcon sx={{ fontSize: 36 }} />,
    color: '#5A5A5A', // Cinza escuro
    action: 'logout',
  },
];

const GAP = 10; // Espaçamento entre os blocos

export const HomeTiles: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const handleTileClick = (tile: TileConfig) => {
    if (tile.action === 'logout') {
      setLogoutDialogOpen(true);
    } else if (tile.path) {
      navigate(tile.path);
    }
  };

  const handleConfirmLogout = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#1F1F1F', // Fundo escuro estilo menu Iniciar
          px: { xs: 2, sm: 4, md: 6 },
          py: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 300,
            mb: 4,
            letterSpacing: 0.5,
            fontSize: { xs: '1.8rem', sm: '2.125rem' },
          }}
        >
          GearOne
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: `repeat(2, 1fr)`, // 2 colunas no celular
              sm: `repeat(3, 1fr)`, // 3 colunas no tablet
              md: `repeat(4, 1fr)`, // 4 colunas no desktop
            },
            gap: `${GAP}px`,
            maxWidth: '100%',
          }}
        >
          {tiles.map((tile) => (
            <Box
              key={tile.label}
              role="button"
              tabIndex={0}
              onClick={() => handleTileClick(tile)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTileClick(tile);
                }
              }}
              sx={{
                // Ajuste dinâmico de colunas para blocos largos
                gridColumn: tile.wide ? { xs: 'span 2', sm: 'span 1', md: 'span 2' } : 'span 1',
                aspectRatio: tile.wide ? { xs: '2 / 1', md: '2 / 1' } : '1 / 1',
                bgcolor: tile.color,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                p: { xs: 1, sm: 1.5 },
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.12s ease',
                borderRadius: '2px',
                '&:hover': {
                  filter: 'brightness(1.1)',
                  transform: 'scale(1.02)',
                },
                '&:active': {
                  filter: 'brightness(0.9)',
                  transform: 'scale(0.98)',
                },
                '&:focus-visible': {
                  outline: '2px solid #fff',
                  outlineOffset: '2px',
                },
              }}
            >
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                {tile.icon}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {tile.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Diálogo de confirmação de logout */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleCancelLogout}
      >
        <DialogTitle>Confirmar Saída</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja sair da aplicação?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">Cancelar</Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained">Sair</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HomeTiles;
