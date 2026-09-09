import { Router, Request, Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { query } from '../db';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, email, nome, perfil, ativo, criado_em, atualizado_em FROM users ORDER BY criado_em DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao listar usuários' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT id, email, nome, perfil, ativo, criado_em, atualizado_em FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar usuário' });
  }
});

export default router;
