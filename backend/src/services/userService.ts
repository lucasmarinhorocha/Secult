import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db';

export interface AppUser {
  id: string;
  email: string;
  nome: string;
  perfil: string;
  ativo: boolean;
  senha: string;
  criado_em: Date;
  atualizado_em: Date;
}

export const findUserByEmail = async (email: string): Promise<AppUser | null> => {
  const result = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0] as AppUser;
};

export const findUserById = async (id: string): Promise<AppUser | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0] as AppUser;
};

export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const createUser = async (email: string, nome: string, password: string, perfil: string = 'RECEPCAO') => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  const result = await query(
    `INSERT INTO users (id, email, nome, perfil, senha, ativo) VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
    [id, email, nome, perfil, hashedPassword]
  );

  return result.rows[0] as AppUser;
};
