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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  quantidade_atual: number;
  quantidade_minima: number;
  localizacao: string;
  unidade: string;
  preco_unitario: number;
  status: string;
}

const Insumos: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([
    {
      id: '1',
      nome: 'Café Premium',
      categoria: 'COPA',
      quantidade_atual: 12,
      quantidade_minima: 5,
      localizacao: 'TERREO',
      unidade: 'PACOTE',
      preco_unitario: 25.00,
      status: 'OK',
    },
    {
      id: '2',
      nome: 'Papel Higiênico',
      categoria: 'HIGIENE',
      quantidade_atual: 3,
      quantidade_minima: 10,
      localizacao: '2_ANDAR',
      unidade: 'CX',
      preco_unitario: 45.00,
      status: 'ALERTA',
    },
    {
      id: '3',
      nome: 'Desinfetante',
      categoria: 'LIMPEZA',
      quantidade_atual: 8,
      quantidade_minima: 5,
      localizacao: 'TERREO',
      unidade: 'LITRO',
      preco_unitario: 15.00,
      status: 'OK',
    },
    {
      id: '4',
      nome: 'Luvas Descartáveis',
      categoria: 'HIGIENE',
      quantidade_atual: 2,
      quantidade_minima: 3,
      localizacao: 'TERREO',
      unidade: 'CX',
      preco_unitario: 30.00,
      status: 'AVISO',
    },
    {
      id: '5',
      nome: 'Toalha de Papel',
      categoria: 'COPA',
      quantidade_atual: 15,
      quantidade_minima: 8,
      localizacao: '2_ANDAR',
      unidade: 'PACOTE',
      preco_unitario: 12.00,
      status: 'OK',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Insumo>>({
    nome: '',
    categoria: 'COPA',
    quantidade_atual: 0,
    quantidade_minima: 0,
    localizacao: 'TERREO',
    unidade: 'PACOTE',
    preco_unitario: 0,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ALERTA':
        return 'error';
      case 'AVISO':
        return 'warning';
      default:
        return 'success';
    }
  };

  const handleOpenDialog = (insumo?: Insumo) => {
    if (insumo) {
      setEditingId(insumo.id);
      setFormData(insumo);
    } else {
      setEditingId(null);
      setFormData({
        nome: '',
        categoria: 'COPA',
        quantidade_atual: 0,
        quantidade_minima: 0,
        localizacao: 'TERREO',
        unidade: 'PACOTE',
        preco_unitario: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = () => {
    if (editingId) {
      setInsumos(
        insumos.map((i) =>
          i.id === editingId
            ? { ...i, ...formData }
            : i
        )
      );
    } else {
      setInsumos([
        ...insumos,
        {
          id: Date.now().toString(),
          ...formData,
          status: 'OK',
        } as Insumo,
      ]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setInsumos(insumos.filter((i) => i.id !== id));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Almoxarifado - Gestão de Insumos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {insumos.length} insumos cadastrados
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Insumo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Categoria</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Quantidade
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Mínimo
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Localização</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Valor Unit.
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {insumos.map((insumo) => (
              <TableRow key={insumo.id} hover>
                <TableCell>{insumo.nome}</TableCell>
                <TableCell>{insumo.categoria}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  {insumo.quantidade_atual} {insumo.unidade}
                </TableCell>
                <TableCell align="center">{insumo.quantidade_minima}</TableCell>
                <TableCell>{insumo.localizacao}</TableCell>
                <TableCell align="right">R$ {insumo.preco_unitario.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={insumo.status}
                    color={getStatusColor(insumo.status) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(insumo)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(insumo.id)}
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
          {editingId ? 'Editar Insumo' : 'Novo Insumo'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nome"
            fullWidth
            value={formData.nome || ''}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={formData.categoria || 'COPA'}
              label="Categoria"
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            >
              <MenuItem value="COPA">Copa</MenuItem>
              <MenuItem value="HIGIENE">Higiene</MenuItem>
              <MenuItem value="LIMPEZA">Limpeza</MenuItem>
              <MenuItem value="OUTROS">Outros</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Quantidade Atual"
            type="number"
            fullWidth
            value={formData.quantidade_atual || 0}
            onChange={(e) =>
              setFormData({ ...formData, quantidade_atual: parseInt(e.target.value) })
            }
          />
          <TextField
            label="Quantidade Mínima"
            type="number"
            fullWidth
            value={formData.quantidade_minima || 0}
            onChange={(e) =>
              setFormData({ ...formData, quantidade_minima: parseInt(e.target.value) })
            }
          />
          <FormControl fullWidth>
            <InputLabel>Localização</InputLabel>
            <Select
              value={formData.localizacao || 'TERREO'}
              label="Localização"
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
            >
              <MenuItem value="TERREO">Térreo</MenuItem>
              <MenuItem value="2_ANDAR">2º Andar</MenuItem>
              <MenuItem value="OUTRO">Outro</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Preço Unitário"
            type="number"
            inputProps={{ step: '0.01' }}
            fullWidth
            value={formData.preco_unitario || 0}
            onChange={(e) =>
              setFormData({ ...formData, preco_unitario: parseFloat(e.target.value) })
            }
          />
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

export default Insumos;
