import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Usuario } from '../../models/types';
import { apiClient } from '../../services/api';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<Usuario[]>('/usuarios');
        setUsers(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao carregar usuários';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Administração de Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhe os cadastros de usuários e acesse informações de login.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Atualizar
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell>Cadastro</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.nome}</TableCell>
                  <TableCell>{user.perfil}</TableCell>
                  <TableCell>{user.ativo ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>{new Date(user.criado_em || user.criadoEm).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminUsers;
