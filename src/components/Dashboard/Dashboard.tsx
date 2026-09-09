import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  EventAvailable as EventIcon,
  People as PeopleIcon,
  Assignment as ContractIcon,
  Inventory2 as InsumoIcon,
} from '@mui/icons-material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalEventos: number;
  totalPublico: number;
  contractosVencendo: number;
  insumosAlerta: number;
  carregando: boolean;
  erro?: string;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}12, white)`, border: `1px solid ${color}22` }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ color, fontSize: 34 }}>{icon}</Box>
        <Chip label="Atualizado" size="small" sx={{ backgroundColor: `${color}16`, color, fontWeight: 600 }} />
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.6 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, display: 'block' }}>
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEventos: 42,
    totalPublico: 376,
    contractosVencendo: 3,
    insumosAlerta: 5,
    carregando: false,
  });

  // Dados simulados para gráficos
  const eventosData = [
    { mes: 'Jan', eventos: 3, publico: 45 },
    { mes: 'Fev', eventos: 4, publico: 52 },
    { mes: 'Mar', eventos: 2, publico: 38 },
    { mes: 'Abr', eventos: 5, publico: 68 },
    { mes: 'Mai', eventos: 7, publico: 89 },
    { mes: 'Jun', eventos: 6, publico: 84 },
  ];

  const alvaraPieData = [
    { name: 'Válidos', value: 5 },
    { name: 'Vencendo', value: 2 },
    { name: 'Vencidos', value: 1 },
  ];

  const COLORS = ['#4caf50', '#ff9800', '#f44336'];

  const handleExportarRelatorio = () => {
    alert('Funcionalidade de exportação será implementada');
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Dashboard Executivo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visão consolidada de eventos, presença e operação do HUB.
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleExportarRelatorio} sx={{ borderRadius: 999 }}>
          Exportar Relatório
        </Button>
      </Stack>

      {stats.erro && <Alert severity="error" sx={{ mb: 2 }}>{stats.erro}</Alert>}
      {stats.carregando && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Eventos no período" value={stats.totalEventos} icon={<EventIcon />} color="#2563eb" subtitle="+12% vs mês anterior" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Público atendido" value={stats.totalPublico} icon={<PeopleIcon />} color="#10b981" subtitle="Alta participação" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Contratos vencendo" value={stats.contractosVencendo} icon={<ContractIcon />} color="#f59e0b" subtitle="Atenção necessária" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Insumos em alerta" value={stats.insumosAlerta} icon={<InsumoIcon />} color="#ef4444" subtitle="Reposição recomendada" />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tendência de eventos e público
              </Typography>
              <Chip label="Últimos 6 meses" size="small" color="primary" variant="outlined" />
            </Stack>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventosData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="eventos" fill="#2563eb" radius={[8, 8, 0, 0]} name="Eventos" />
                <Bar dataKey="publico" fill="#10b981" radius={[8, 8, 0, 0]} name="Público" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Status dos alvarás
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alvaraPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={86}
                  dataKey="value"
                >
                  {alvaraPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Atividades recentes
          </Typography>
          <Button variant="outlined" size="small">Ver tudo</Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1.5}>
          {[
            'Nova ocorrência técnica resolvida em 14 min.',
            'Reposição de insumos solicitada para o almoxarifado.',
            'Presença registrada via QR Code em evento da tarde.',
          ].map((item, index) => (
            <Box key={index} sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="body2">{item}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Dashboard;
