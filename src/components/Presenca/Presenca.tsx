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
  Card,
  CardContent,
  Divider,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Participante {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  horario_checkin: string;
  metodo_checkin: string;
  consentimento_lgpd: boolean;
}

interface ListaPresenca {
  id: string;
  evento: string;
  data_criacao: string;
  status: string;
  participantes: Participante[];
  total_participantes: number;
}

const Presenca: React.FC = () => {
  const [listas, setListas] = useState<ListaPresenca[]>([
    {
      id: '1',
      evento: 'Workshop de React - Avançado',
      data_criacao: '2026-07-08',
      status: 'EM_USO',
      total_participantes: 34,
      participantes: [
        {
          id: '1',
          nome: 'Ana Costa',
          email: 'ana@example.com',
          cpf: '12345678901',
          horario_checkin: '09:00',
          metodo_checkin: 'QR_CODE',
          consentimento_lgpd: true,
        },
        {
          id: '2',
          nome: 'Bruno Silva',
          email: 'bruno@example.com',
          cpf: '12345678902',
          horario_checkin: '09:05',
          metodo_checkin: 'QR_CODE',
          consentimento_lgpd: true,
        },
        {
          id: '3',
          nome: 'Carlos Mendes',
          email: 'carlos@example.com',
          cpf: '12345678903',
          horario_checkin: '09:15',
          metodo_checkin: 'MANUAL',
          consentimento_lgpd: true,
        },
      ],
    },
    {
      id: '2',
      evento: 'Meetup - Vue.js Comunidade',
      data_criacao: '2026-07-09',
      status: 'FINALIZADA',
      total_participantes: 52,
      participantes: [
        {
          id: '4',
          nome: 'Diana Rocha',
          email: 'diana@example.com',
          cpf: '12345678904',
          horario_checkin: '18:30',
          metodo_checkin: 'QR_CODE',
          consentimento_lgpd: true,
        },
        {
          id: '5',
          nome: 'Eduardo Nunes',
          email: 'edu@example.com',
          cpf: '12345678905',
          horario_checkin: '18:35',
          metodo_checkin: 'QR_CODE',
          consentimento_lgpd: true,
        },
      ],
    },
    {
      id: '3',
      evento: 'Palestra - Transformação Digital',
      data_criacao: '2026-07-10',
      status: 'PLANEJADA',
      total_participantes: 0,
      participantes: [],
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedLista, setSelectedLista] = useState<ListaPresenca | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ListaPresenca>>({
    evento: '',
    status: 'PLANEJADA',
  });

  const [openParticipanteDialog, setOpenParticipanteDialog] = useState(false);
  const [participanteData, setParticipanteData] = useState<Partial<Participante>>({
    nome: '',
    email: '',
    cpf: '',
    horario_checkin: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    metodo_checkin: 'QR_CODE',
    consentimento_lgpd: true,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANEJADA':
        return 'default';
      case 'EM_USO':
        return 'warning';
      case 'FINALIZADA':
        return 'success';
      case 'SINCRONIZADA':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANEJADA':
        return 'Planejada';
      case 'EM_USO':
        return 'Em Uso';
      case 'FINALIZADA':
        return 'Finalizada';
      case 'SINCRONIZADA':
        return 'Sincronizada';
      default:
        return status;
    }
  };

  const handleOpenDialog = (lista?: ListaPresenca) => {
    if (lista) {
      setEditingId(lista.id);
      setFormData(lista);
    } else {
      setEditingId(null);
      setFormData({ evento: '', status: 'PLANEJADA' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = () => {
    if (editingId) {
      setListas(
        listas.map((l) =>
          l.id === editingId
            ? { ...l, ...formData }
            : l
        )
      );
    } else {
      setListas([
        ...listas,
        {
          id: Date.now().toString(),
          ...formData,
          data_criacao: new Date().toISOString().split('T')[0],
          participantes: [],
          total_participantes: 0,
        } as ListaPresenca,
      ]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setListas(listas.filter((l) => l.id !== id));
  };

  const handleAddParticipante = () => {
    if (selectedLista && participanteData.nome) {
      const updatedListas = listas.map((l) => {
        if (l.id === selectedLista.id) {
          const newParticipante: Participante = {
            id: Date.now().toString(),
            nome: participanteData.nome || '',
            email: participanteData.email || '',
            cpf: participanteData.cpf || '',
            horario_checkin: participanteData.horario_checkin || '',
            metodo_checkin: participanteData.metodo_checkin || 'QR_CODE',
            consentimento_lgpd: participanteData.consentimento_lgpd ?? true,
          };
          return {
            ...l,
            participantes: [...l.participantes, newParticipante],
            total_participantes: l.total_participantes + 1,
          };
        }
        return l;
      });
      setListas(updatedListas);
      setSelectedLista(updatedListas.find((l) => l.id === selectedLista.id) || null);
      setParticipanteData({
        nome: '',
        email: '',
        cpf: '',
        horario_checkin: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        metodo_checkin: 'QR_CODE',
        consentimento_lgpd: true,
      });
      setOpenParticipanteDialog(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Listas de Presença - QR Code
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {listas.length} listas criadas | {listas.reduce((acc, l) => acc + l.total_participantes, 0)} participantes
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Lista
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {listas.map((lista) => (
          <Card key={lista.id} sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ pb: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  mb: 2,
                }}
              >
                <div>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {lista.evento}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Criada em: {lista.data_criacao}
                  </Typography>
                </div>
                <Chip
                  label={getStatusLabel(lista.status)}
                  color={getStatusColor(lista.status) as any}
                  size="small"
                  variant="filled"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {lista.total_participantes}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Participantes
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#388e3c' }}>
                    {lista.participantes.filter((p) => p.metodo_checkin === 'QR_CODE').length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    QR Code
                  </Typography>
                </Box>
              </Box>

              {lista.participantes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Últimos registros:
                  </Typography>
                  <AvatarGroup max={4} sx={{ mt: 1 }}>
                    {lista.participantes.slice(0, 4).map((p) => (
                      <Avatar key={p.id} title={p.nome} sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                        {p.nome.split(' ')[0][0]}{p.nome.split(' ')[1]?.[0] || ''}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<QrCode2Icon />}
                  onClick={() => {
                    setSelectedLista(lista);
                    setOpenDetailDialog(true);
                  }}
                  fullWidth
                >
                  Ver QR Code
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog(lista)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(lista.id)}
                >
                  Deletar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Dialog Nova Lista */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Lista' : 'Nova Lista de Presença'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nome do Evento"
            fullWidth
            value={formData.evento || ''}
            onChange={(e) => setFormData({ ...formData, evento: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status || 'PLANEJADA'}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="PLANEJADA">Planejada</MenuItem>
              <MenuItem value="EM_USO">Em Uso</MenuItem>
              <MenuItem value="FINALIZADA">Finalizada</MenuItem>
              <MenuItem value="SINCRONIZADA">Sincronizada</MenuItem>
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

      {/* Dialog Detalhes */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedLista?.evento} - Participantes
        </DialogTitle>
        <DialogContent sx={{ minHeight: '300px' }}>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenParticipanteDialog(true)}
              sx={{ mb: 2 }}
            >
              Adicionar Participante
            </Button>

            {selectedLista?.participantes.length === 0 ? (
              <Typography color="textSecondary">
                Nenhum participante registrado ainda.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Horário</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Método</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        LGPD
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedLista?.participantes.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.nome}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{p.horario_checkin}</TableCell>
                        <TableCell>
                          <Chip
                            label={p.metodo_checkin}
                            size="small"
                            color={p.metodo_checkin === 'QR_CODE' ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {p.consentimento_lgpd && (
                            <CheckCircleIcon sx={{ color: 'green', fontSize: '1.2rem' }} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Adicionar Participante */}
      <Dialog
        open={openParticipanteDialog}
        onClose={() => setOpenParticipanteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Adicionar Participante</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nome"
            fullWidth
            value={participanteData.nome || ''}
            onChange={(e) => setParticipanteData({ ...participanteData, nome: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={participanteData.email || ''}
            onChange={(e) => setParticipanteData({ ...participanteData, email: e.target.value })}
          />
          <TextField
            label="CPF"
            fullWidth
            value={participanteData.cpf || ''}
            onChange={(e) => setParticipanteData({ ...participanteData, cpf: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Método de Checkin</InputLabel>
            <Select
              value={participanteData.metodo_checkin || 'QR_CODE'}
              label="Método de Checkin"
              onChange={(e) =>
                setParticipanteData({ ...participanteData, metodo_checkin: e.target.value })
              }
            >
              <MenuItem value="QR_CODE">QR Code</MenuItem>
              <MenuItem value="MANUAL">Manual</MenuItem>
              <MenuItem value="IMPORT">Importado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenParticipanteDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddParticipante} variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Presenca;
