import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Mock data
const eventos = [
  {
    id: '1',
    titulo: 'Evento 1',
    dataInicio: new Date('2026-07-15'),
    dataFim: new Date('2026-07-16'),
    local: 'São Paulo',
    publicoTotal: 500,
    status: 'PLANEJADO',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
];

router.get('/', authMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: eventos,
  });
});

router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const evento = eventos.find(e => e.id === id);

  if (!evento) {
    return res.status(404).json({
      success: false,
      error: 'Event not found',
    });
  }

  res.json({
    success: true,
    data: evento,
  });
});

router.post('/', authMiddleware, (req: Request, res: Response) => {
  const { titulo, dataInicio, dataFim, local, publicoTotal } = req.body;

  const newEvento = {
    id: String(eventos.length + 1),
    titulo,
    dataInicio: new Date(dataInicio),
    dataFim: new Date(dataFim),
    local,
    publicoTotal,
    status: 'PLANEJADO',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  eventos.push(newEvento);

  res.status(201).json({
    success: true,
    data: newEvento,
  });
});

export default router;
