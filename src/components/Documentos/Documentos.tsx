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
  IconButton,
  Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';

interface Documento {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  data_geracao: string;
  usuario_gerador: string;
  arquivo_url: string;
  status: string;
}

const Documentos: React.FC = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([
    {
      id: '1',
      tipo: 'CARTA_ANUENCIA',
      titulo: 'Carta de Anuência - Evento Janeiro',
      descricao: 'Autorização para realização de evento no HUB',
      data_geracao: '2026-07-05',
      usuario_gerador: 'Admin',
      arquivo_url: '/docs/carta_anuencia_01.pdf',
      status: 'FINALIZADO',
    },
    {
      id: '2',
      tipo: 'RELATORIO',
      titulo: 'Relatório Mensal de Atividades - Junho 2026',
      descricao: 'Consolidação de todas as atividades do mês',
      data_geracao: '2026-07-01',
      usuario_gerador: 'Coordenador',
      arquivo_url: '/docs/relatorio_junho_2026.pdf',
      status: 'FINALIZADO',
    },
    {
      id: '3',
      tipo: 'CARTA_ANUENCIA',
      titulo: 'Carta de Anuência - Evento Fevereiro',
      descricao: 'Autorização para realização de evento no HUB',
      data_geracao: '2026-07-08',
      usuario_gerador: 'Admin',
      arquivo_url: '/docs/carta_anuencia_02.pdf',
      status: 'RASCUNHO',
    },
    {
      id: '4',
      tipo: 'RELATORIO',
      titulo: 'Relatório de Insumos - Julho 2026',
      descricao: 'Consolidação de insumos utilizados no mês',
      data_geracao: '2026-07-10',
      usuario_gerador: 'Almoxarife',
      arquivo_url: '/docs/relatorio_insumos_julho.pdf',
      status: 'PROCESSANDO',
    },
    {
      id: '5',
      tipo: 'OUTROS',
      titulo: 'Ata de Reunião - Conselho Administrativo',
      descricao: 'Registro das decisões da reunião de 08/07',
      data_geracao: '2026-07-09',
      usuario_gerador: 'Secretária',
      arquivo_url: '/docs/ata_reuniao_080726.pdf',
      status: 'FINALIZADO',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Documento>>({
    tipo: 'CARTA_ANUENCIA',
    titulo: '',
    descricao: '',
    usuario_gerador: 'Admin',
    status: 'RASCUNHO',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINALIZADO':
        return 'success';
      case 'RASCUNHO':
        return 'default';
      case 'PROCESSANDO':
        return 'warning';
      case 'ERRO':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'CARTA_ANUENCIA':
        return 'Carta de Anuência';
      case 'RELATORIO':
        return 'Relatório';
      case 'OUTROS':
        return 'Outros';
      default:
        return tipo;
    }
  };

  const handleOpenDialog = (documento?: Documento) => {
    if (documento) {
      setEditingId(documento.id);
      setFormData(documento);
    } else {
      setEditingId(null);
      setFormData({
        tipo: 'CARTA_ANUENCIA',
        titulo: '',
        descricao: '',
        usuario_gerador: 'Admin',
        status: 'RASCUNHO',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = () => {
    if (editingId) {
      setDocumentos(
        documentos.map((d) =>
          d.id === editingId
            ? { ...d, ...formData }
            : d
        )
      );
    } else {
      setDocumentos([
        ...documentos,
        {
          id: Date.now().toString(),
          ...formData,
          data_geracao: new Date().toISOString().split('T')[0],
          arquivo_url: `/docs/documento_${Date.now()}.pdf`,
        } as Documento,
      ]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setDocumentos(documentos.filter((d) => d.id !== id));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Documentos Gerados
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {documentos.length} documentos no sistema
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Documento
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Gerado por</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documentos.map((documento) => (
              <TableRow key={documento.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DescriptionIcon sx={{ fontSize: '1.2rem', color: '#1976d2' }} />
                    <Typography variant="caption">{getTipoLabel(documento.tipo)}</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, maxWidth: 200 }}>
                  {documento.titulo}
                </TableCell>
                <TableCell sx={{ maxWidth: 250, fontSize: '0.875rem' }}>
                  {documento.descricao.substring(0, 50)}...
                </TableCell>
                <TableCell>{documento.data_geracao}</TableCell>
                <TableCell>{documento.usuario_gerador}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={documento.status}
                    color={getStatusColor(documento.status) as any}
                    size="small"
                    variant="filled"
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {documento.status === 'FINALIZADO' && (
                      <IconButton
                        size="small"
                        href={documento.arquivo_url}
                        download
                        title="Baixar documento"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(documento)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(documento.id)}
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
          {editingId ? 'Editar Documento' : 'Novo Documento'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.tipo || 'CARTA_ANUENCIA'}
              label="Tipo"
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            >
              <MenuItem value="CARTA_ANUENCIA">Carta de Anuência</MenuItem>
              <MenuItem value="RELATORIO">Relatório</MenuItem>
              <MenuItem value="OUTROS">Outros</MenuItem>
            </Select>
          </FormControl>
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
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status || 'RASCUNHO'}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="RASCUNHO">Rascunho</MenuItem>
              <MenuItem value="PROCESSANDO">Processando</MenuItem>
              <MenuItem value="FINALIZADO">Finalizado</MenuItem>
              <MenuItem value="ERRO">Erro</MenuItem>
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

export default Documentos;
