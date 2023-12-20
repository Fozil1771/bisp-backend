import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin, PrismaClient, Student, Teacher } from '@prisma/client';

const JWT_SECRET = process.env.SECRET_KEY || 'SUPER SECRET';

const prisma = new PrismaClient();

type AuthRequest = Request & { teacher?: Teacher };

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Authentication
  const authHeader = req.headers['authorization'];
  const jwtToken = authHeader?.split(' ')[1];

  // console.log(req.headers)

  // console.log(authHeader)
  // console.log(jwtToken)
  if (!jwtToken) {
    return res.sendStatus(401);
  }

  // decode the jwt token
  try {


    const payload = (await jwt.verify(jwtToken, JWT_SECRET)) as {
      tokenId: number;
    };

    console.log("payload", payload);

    const dbToken = await prisma.token.findUnique({
      where: { id: payload.tokenId },
      include: { teacher: true },
    });

    if (!dbToken?.valid || dbToken.expiration < new Date()) {
      return res.status(401).json({ error: 'API token expired' });
    }

    // let user: Admin | Teacher | Student | null = null;

    // if (payload.adminId) {
    //   user = await prisma.admin.findUnique({
    //     where: { id: payload.adminId },
    //   });
    // } else if (payload.teacherId) {
    //   user = await prisma.teacher.findUnique({
    //     where: { id: payload.teacherId },
    //   });
    // } else if (payload.studentId) {
    //   user = await prisma.student.findUnique({
    //     where: { id: payload.studentId },
    //   });
    // }

    // if (!user) {
    //   return res.sendStatus(401);
    // }

    req.teacher = dbToken.teacher || undefined;

    console.log("req.teacher: ", req.teacher)
    console.log(dbToken)
  } catch (e) {
    return res.sendStatus(401);
  }

  next();
}
