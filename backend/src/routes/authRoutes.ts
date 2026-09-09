import { Request, Response } from 'express';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { findUserByEmail, verifyPassword, createUser } from '../services/userService';
import logger from '../logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.senha))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    if (!user.ativo) {
      return res.status(403).json({
        success: false,
        error: 'User is inactive',
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      perfil: user.perfil,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      perfil: user.perfil,
    });

    return res.json({
      success: true,
      data: {
        token,
        refreshToken,
        usuario: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          perfil: user.perfil,
          ativo: user.ativo,
        },
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    try {
      const decoded = verifyRefreshToken(token);
      const newToken = generateToken({
        id: decoded.id,
        email: decoded.email,
        perfil: decoded.perfil,
      });

      return res.json({
        success: true,
        data: { token: newToken },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, password, perfil } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e senha são obrigatórios',
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Já existe um usuário com este email',
      });
    }

    const user = await createUser(email, nome, password, perfil || 'RECEPCAO');

    const token = generateToken({
      id: user.id,
      email: user.email,
      perfil: user.perfil,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      perfil: user.perfil,
    });

    return res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        usuario: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          perfil: user.perfil,
          ativo: user.ativo,
        },
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
