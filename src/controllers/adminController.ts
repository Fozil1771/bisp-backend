import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { emailVerification } from '../services/emailVerification';
const prisma = new PrismaClient();

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER SECRET';
interface RequestWitSession extends Request {
  session: any;
  // Add other custom properties as needed
}

// Controller logic
// get by id

const getAdminById = async (req: RequestWitSession, res: Response) => {
  const { id } = req.params;
  if (req.session.userId) {
    try {
      const getAdmin = await prisma.admin.findUniqueOrThrow({
        where: {
          id: id
        },
        include: {
          teachers: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              verified: true
            }
          }
        }
      });

      res.status(200).json(getAdmin);
    } catch (error) {
      res.status(404).json({ error: "No data found" });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }

}

// get all
const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const allAdmins = await prisma.admin.findMany({});


    res.json(allAdmins);
  } catch (error) {
    res.status(404).json({ error: "No data found" });
  }
}

// create

const createAdmin = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    const expiration = new Date(
      new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000
    );

    const token = await prisma.token.create({
      data: {
        expiration,
        adminId: admin.id
      }
    })

    emailVerification(admin, token);
    res.status(200).json(admin);
  } catch (error) {
    res.status(404).json({ error: error });
  }
}


// delete admin

const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  await prisma.admin.delete({
    where: {
      id: id
    }
  });
  res.status(200);
  next();
}


// verify admin itself

const verifyAdmin = async (req: Request, res: Response) => {
  const adminId = req.params.adminId;
  const tokenId = req.params.tokenId;

  const admin = await prisma.admin.findUniqueOrThrow({
    where: {
      id: adminId
    }
  });

  const token = await prisma.token.findUniqueOrThrow({
    where: {
      id: Number(tokenId)
    }
  });

  if (!admin || !token) {
    return res.status(404).json({ error: 'Data not found' });
  }

  if (token.adminId !== admin.id) {
    return res.status(401).json({ error: 'Invalid token for the admin' });
  }

  if (!token.valid || token.expiration < new Date()) {
    return res.status(401).json({ error: 'Token expired' });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { verified: true }
  });

  await prisma.token.update({
    where: { id: token.id },
    data: { valid: false }
  })

  res.status(200).json({ message: 'Verification successful' });
  res.redirect('/home')
  console.log(admin)
}


// verify teacher
const verifyTeacher = async (req: Request, res: Response) => {
  const { teacherId } = req.params;

  try {
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: { verifiedTeacher: true },
    });

    res.status(200).json({ message: 'Teacher verified successfully', teacher: updatedTeacher });
  } catch (error) {
    console.error('Error verifying teacher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  verifyAdmin,
  verifyTeacher,
  getAllAdmins,
  createAdmin,
  getAdminById,
  deleteById,
}