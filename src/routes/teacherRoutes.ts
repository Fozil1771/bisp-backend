import express, { Request as ExpressRequest, Response, NextFunction } from 'express';

import { createTeacher, getTeachers, deleteTeacherById, getTeacherById, getEnrolledParticipants } from '../controllers/teacherController';

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../auth';

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcwMjg1ODcyNSwiaWF0IjoxNzAyODU4NzI1fQ.vCVu2XCpeE_vhtBCn1ryV2SU8ediTWbmuti7FWv6uVE" //process.env.JWT_SECRET;

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:id', authenticateToken, getTeacherById);
router.get('/', authenticateToken, getTeachers);
router.get('/:courseId/enrolled-participants', getEnrolledParticipants);

router.post('/', createTeacher);
router.delete('/:id', deleteTeacherById);


// Generate a random 8 digit number as the email token
function generateEmailToken(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateAuthToken(tokenId: number): string {
  const jwtPayload = { tokenId };

  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: 'HS256',
    noTimestamp: true,
  });
}


router.post('/login', async (req, res) => {
  const { email } = req.body;

  // generate token
  const emailToken = generateEmailToken();
  const expiration = new Date(
    new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
  );

  try {
    const createdToken = await prisma.token.create({
      data: {
        type: 'EMAIL',
        emailToken,
        expiration,
        teacher: {
          connectOrCreate: {
            where: { email },
            create: {
              email
            },
          },
        },
      },
    });

    console.log(createdToken);
    // TODO send emailToken to user's email
    // await sendEmailToken(email, emailToken);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .json({ error: "Couldn't start the authentication process" });
  }
});

// Validate the emailToken
// Generate a long-lived JWT token
router.post('/authenticate', async (req, res) => {
  const { email, emailToken } = req.body;

  const dbEmailToken = await prisma.token.findUnique({
    where: {
      emailToken,
    },
    include: {
      teacher: true
    },
  });

  if (!dbEmailToken || !dbEmailToken.valid) {
    return res.sendStatus(401);
  }

  if (dbEmailToken.expiration < new Date()) {
    return res.status(401).json({ error: 'Token expired!' });
  }

  const user = dbEmailToken.teacher

  if (!user || user.email !== email) {
    return res.sendStatus(401);
  }

  // Here we validated that the user is the owner of the email

  // generate an API token
  const expiration = new Date(
    new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000
  );
  const apiToken = await prisma.token.create({
    data: {
      type: 'API',
      expiration,
      teacher: {
        connect: {
          email
        }
      },
    },
  });

  // Invalidate the email
  await prisma.token.update({
    where: { id: dbEmailToken.id },
    data: { valid: false },
  });

  // generate the JWT token
  const authToken = generateAuthToken(apiToken.id);

  res.json({ authToken });
});

export default router;