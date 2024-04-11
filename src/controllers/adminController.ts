import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

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

    const allAdmins = await prisma.admin.findMany();


    res.json(allAdmins);
  } catch (error) {
    res.status(404).json({ error: "No data found" });
  }
}

// create




// delete admin

const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  await prisma.admin.delete({
    where: {
      id: id
    }
  });

  // await prisma.token.deleteMany({
  //   where: {
  //     userId: id
  //   }
  // })
  res.status(200);
  next();
}


// verify admin itself

const verifyAdmin = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const tokenId = req.params.tokenId;

  console.log(userId, tokenId)
  console.log("verified")

  const admin = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
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

  if (token.userId !== admin.id) {
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

  // res.status(200).json({ message: 'Verification successful' });
  res.redirect('http://localhost:5173/login')
  // res.redirect('/home')
  console.log(admin)
}


// verify teacher
const verifiedTeacherByAdmin = async (req: Request, res: Response) => {
  const { teacherId } = req.params;
  const { adminId, isVerified } = req.body;


  try {

    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      include: {
        admin: true
      },
      data: { verifiedTeacher: isVerified, adminId: adminId },
    });

    res.status(200).json({ message: 'Teacher verified successfully', teacher: updatedTeacher });
  } catch (error) {
    console.error('Error verifying teacher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  verifyAdmin,
  verifiedTeacherByAdmin,
  getAllAdmins,
  getAdminById,
  deleteById,
}