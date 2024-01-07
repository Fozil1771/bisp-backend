import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, Secret } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.SECRET_KEY || 'SUPER SECRET';
const prisma = new PrismaClient();


export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
 
  // Authentication
  const token: string | undefined = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, 'your-secret-key', (err: VerifyErrors | null, user: any) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    const { id, username } = user;
    

    req.user = user;
    next();
  });
}
