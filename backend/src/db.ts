import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from './config';

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
});

export const query = async (text: string, params: any[] = []) => {
  return pool.query(text, params);
};

export const initDb = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      perfil TEXT NOT NULL,
      senha TEXT NOT NULL,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

export const seedAdminUser = async () => {
  const email = 'admin@gearone.com';
  const result = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (result.rowCount === 0) {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);
    const id = crypto.randomUUID();

    await query(
      `INSERT INTO users (id, email, nome, perfil, senha, ativo) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, email, 'Administrador', 'ADMIN', hashedPassword, true]
    );
  }
};
