import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, Secret } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { PrismaClient } from '@prisma/client';


export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

  // Authentication
  const token: string | undefined = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, 'your-secret-key', (err: VerifyErrors | null, user: any) => {
    if (err) {
      console.log(token)
      console.log(err)
      return res.sendStatus(403); // Forbidden
    }

    req.user = user;
    next();
  });
}
