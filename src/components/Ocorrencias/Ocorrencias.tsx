import React, { useState } from 'react';
import {
  Container,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Typography,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';

interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  localidade: string;
  severidade: string;
  status: string;
  usuario_reporter: string;
  data_abertura: string;
  data_resolucao?: string;
}

const Ocorrencias: React.FC = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([
    {
      id: '1',
      titulo: 'Elevador com falha',
      descricao: 'Elevador não está descendo do 2º andar',
      tipo: 'ELEVADOR',
      localidade: 'Bloco A - Entrada',
      severidade: 'ALTA',
      status: 'EM_ATENDIMENTO',
      usuario_reporter: 'João Silva',
      data_abertura: '2026-07-10 14:30',
    },
    {
      id: '2',
      titulo: 'Ar condicionado quebrado',
      descricao: 'Ar condicionado não está refrigerando a sala',
      tipo: 'AR_CONDICIONADO',
      localidade: 'Sala 201',
      severidade: 'MEDIA',
      status: 'ABERTA',
      usuario_reporter: 'Maria Santos',
      data_abertura: '2026-07-10 10:15',
    },
    {
      id: '3',
      titulo: 'Tomadas queimadas',
      descricao: 'Três tomadas queimadas na sala de reunião',
      tipo: 'TOMADAS',
      localidade: 'Sala de Reunião',
      severidade: 'MEDIA',
      status: 'RESOLVIDA',
      usuario_reporter: 'Carlos Mendes',
      data_abertura: '2026-07-09 09:00',
      data_resolucao: '2026-07-10 11:30',
    },
    {
      id: '4',
      titulo: 'Forro danificado',
      descricao: 'Placa de forro caiu no corredor',
      tipo: 'FORRO',
      localidade: 'Corredor 2º Andar',
      severidade: 'ALTA',
      status: 'EM_ATENDIMENTO',
      usuario_reporter: 'Administrador',
      data_abertura: '2026-07-10 15:45',
    },
    {
      id: '5',
      titulo: 'Porta travada',
      descricao: 'Porta da sala não abre/fecha normalmente',
      tipo: 'OUTRO',
      localidade: 'Sala 105',
      severidade: 'BAIXA',
      status: 'ABERTA',
      usuario_reporter: 'Recepção',
      data_abertura: '2026-07-10 08:30',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Ocorrencia>>({
    titulo: '',
    descricao: '',
    tipo: 'ELEVADOR',
    localidade: '',
    severidade: 'MEDIA',
    status: 'ABERTA',
    usuario_reporter: 'Administrador',
  });

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case 'ALTA':
        return 'error';
      case 'MEDIA':
        return 'warning';
      case 'BAIXA':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTA':
        return 'info';
      case 'EM_ATENDIMENTO':
        return 'warning';
      case 'RESOLVIDA':
        return 'success';
      case 'CANCELADA':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleOpenDialog = (ocorrencia?: Ocorrencia) => {
    if (ocorrencia) {
      setEditingId(ocorrencia.id);
      setFormData(ocorrencia);
    } else {
      setEditingId(null);
      setFormData({
        titulo: '',
        descricao: '',
        tipo: 'ELEVADOR',
        localidade: '',
        severidade: 'MEDIA',
        status: 'ABERTA',
        usuario_reporter: 'Administrador',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = () => {
    if (editingId) {
      setOcorrencias(
        ocorrencias.map((o) =>
          o.id === editingId
            ? { ...o, ...formData }
            : o
        )
      );
    } else {
      setOcorrencias([
        ...ocorrencias,
        {
          id: Date.now().toString(),
          ...formData,
          data_abertura: new Date().toLocaleString('pt-BR'),
        } as Ocorrencia,
      ]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setOcorrencias(ocorrencias.filter((o) => o.id !== id));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Ocorrências Técnicas
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {ocorrencias.filter((o) => o.status === 'ABERTA' || o.status === 'EM_ATENDIMENTO').length} ocorrências abertas
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Ocorrência
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Localidade</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Severidade
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Reporter</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ocorrencias.map((ocorrencia) => (
              <TableRow key={ocorrencia.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{ocorrencia.titulo}</TableCell>
                <TableCell>{ocorrencia.tipo}</TableCell>
                <TableCell>{ocorrencia.localidade}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={ocorrencia.severidade}
                    color={getSeveridadeColor(ocorrencia.severidade) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={ocorrencia.status}
                    color={getStatusColor(ocorrencia.status) as any}
                    size="small"
                    variant="filled"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {ocorrencia.usuario_reporter.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="caption">{ocorrencia.usuario_reporter}</Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(ocorrencia)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(ocorrencia.id)}
                    >
                      Deletar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Ocorrência' : 'Nova Ocorrência'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Título"
            fullWidth
            value={formData.titulo || ''}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />
          <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={3}
            value={formData.descricao || ''}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.tipo || 'ELEVADOR'}
              label="Tipo"
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            >
              <MenuItem value="ELEVADOR">Elevador</MenuItem>
              <MenuItem value="TOMADAS">Tomadas</MenuItem>
              <MenuItem value="AR_CONDICIONADO">Ar Condicionado</MenuItem>
              <MenuItem value="FORRO">Forro</MenuItem>
              <MenuItem value="OUTRO">Outro</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Localidade"
            fullWidth
            value={formData.localidade || ''}
            onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Severidade</InputLabel>
            <Select
              value={formData.severidade || 'MEDIA'}
              label="Severidade"
              onChange={(e) => setFormData({ ...formData, severidade: e.target.value })}
            >
              <MenuItem value="BAIXA">Baixa</MenuItem>
              <MenuItem value="MEDIA">Média</MenuItem>
              <MenuItem value="ALTA">Alta</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status || 'ABERTA'}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="ABERTA">Aberta</MenuItem>
              <MenuItem value="EM_ATENDIMENTO">Em Atendimento</MenuItem>
              <MenuItem value="RESOLVIDA">Resolvida</MenuItem>
              <MenuItem value="CANCELADA">Cancelada</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Ocorrencias;
