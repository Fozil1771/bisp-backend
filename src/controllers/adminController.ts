import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();


// Controller logic
// get by id

const getAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;

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
  try {
    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password
      }
    });

    res.status(200).json(admin);
  } catch (error) {
    res.status(404).json({ error: error });
  }
}


// delete admin

const deleteById = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.admin.delete({
    where: {
      id: id
    }
  });
  res.status(200);
}

// verify teacher
const verifyTeacher = async (req: Request, res: Response) => {
  const { teacherId } = req.params;

  try {
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: { verified: true },
    });

    res.status(200).json({ message: 'Teacher verified successfully', teacher: updatedTeacher });
  } catch (error) {
    console.error('Error verifying teacher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  verifyTeacher,
  getAllAdmins,
  createAdmin,
  getAdminById,
  deleteById
}