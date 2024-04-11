import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { emailVerification } from '../services/emailVerification';
const prisma = new PrismaClient();

const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER SECRET';

const expiration = new Date(
  new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000
);

const createUser = async (userData: any, userType: any) => {
  const { username, firstName, lastName, email, password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const checkUserInDb = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username
        },
        {
          email
        }
      ]
    }
  })

  console.log(checkUserInDb)

  if (checkUserInDb) {
    return {
      error: 'User already exists'
    };
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      type: userType
    }
  })


  switch (userType) {
    case "ADMIN":
      await prisma.admin.create({
        data: {
          id: user.id,
          username,
          email,
          password: hashedPassword
        }
      });
      break;

    case "TEACHER":
      await prisma.teacher.create({
        data: {
          id: user.id,
          username,
          firstName,
          lastName,
          email,
          password: hashedPassword
        }
      });
      break;

    case "STUDENT":
      await prisma.student.create({
        data: {
          id: user.id,
          username,
          email,
          password: hashedPassword
        }
      });
      break;

    default:
      break;
  }

  const token = await prisma.token.create({
    data: {
      expiration,
      userId: user.id
    }
  })


  emailVerification(user, token);

}


export {
  createUser
}