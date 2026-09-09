import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
  Dashboard as DashboardIcon,
  Inventory2 as InsumoIcon,
  BuildCircle as OcorrenciaIcon,
  Description as DocumentoIcon,
  QrCode2 as PresencaIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Apps as HomeTilesIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeMode } from '../../context/ThemeContext';

const DRAWER_WIDTH = 280;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode, toggleMode } = useThemeMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const menuItems = [
    { label: 'Home', path: '/home', icon: <HomeTilesIcon /> },
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Insumos', path: '/insumos', icon: <InsumoIcon /> },
    { label: 'Ocorrências', path: '/ocorrencias', icon: <OcorrenciaIcon /> },
    { label: 'Documentos', path: '/documentos', icon: <DocumentoIcon /> },
    { label: 'Presença', path: '/presenca', icon: <PresencaIcon /> },
    { label: 'Administração', path: '/admin/users', icon: <DashboardIcon /> },
  ];

  const drawer = (
    <Box sx={{ padding: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2.5,
          p: 1.2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))',
        }}
      >
        <Avatar sx={{ mr: 1.2, background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
          {usuario?.nome.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {usuario?.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {usuario?.perfil}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ marginTop: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mb: 0.6,
                backgroundColor:
                  location.pathname === item.path ? 'rgba(37,99,235,0.12)' : 'transparent',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(37,99,235,0.12)',
                  color: 'primary.main',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ marginY: 2 }} />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
          boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
        }}
      >
        <Toolbar>
          <MenuIcon
            onClick={handleDrawerToggle}
            sx={{ marginRight: 2, display: { sm: 'none' }, cursor: 'pointer' }}
          />

          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            GearOne - Sistema de Gestão do HUB
          </Typography>

          <Badge badgeContent={4} color="error" sx={{ marginRight: 2, cursor: 'pointer' }}>
            <NotificationsIcon />
          </Badge>

          {/* Theme toggle */}
          <IconButton sx={{ mr: 1 }} onClick={toggleMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          <Avatar
            onClick={handleProfileMenuOpen}
            sx={{
              backgroundColor: 'secondary.main',
              cursor: 'pointer',
              width: 40,
              height: 40,
            }}
          >
            {usuario?.nome.charAt(0).toUpperCase()}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="textSecondary">
                {usuario?.email}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="textSecondary">
                Perfil: {usuario?.perfil}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Sair</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer - Desktop */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, width: DRAWER_WIDTH, flexShrink: 0 }}>
        <Box sx={{ backgroundColor: 'background.paper', height: '100vh', overflowY: 'auto', borderRight: '1px solid rgba(15, 23, 42, 0.06)' }}>
          {drawer}
        </Box>
      </Box>

      {/* Drawer - Mobile */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
        }}
      >
        <Box
          sx={{
            width: DRAWER_WIDTH,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1 }}>
            <CloseIcon onClick={handleDrawerToggle} sx={{ cursor: 'pointer' }} />
          </Box>
          {drawer}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: { xs: 2, md: 3 },
          marginTop: 8,
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;