import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'
const prisma = new PrismaClient();


// get by id
const getTeacherById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const teacher = await prisma.teacher.findUniqueOrThrow({
      where: {
        id: id
      },
      include: {
        admin: true
      }
    });

    res.json(teacher);
  } catch (error) {
    res.send(404).json({ error: "No data found" })
  }
}

// get all
const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany();
    res.status(200).json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// create teacher

const createTeacher = async (req: Request, res: Response) => {
  const { username, firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const createdTeacher = await prisma.teacher.create({
      data: {
        username,
        firstName,
        lastName,
        email,
        password: hashedPassword
      },
    });

    res.status(201).json({ message: 'Teacher created successfully', teacher: createdTeacher });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete

const deleteTeacherById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.teacher.delete({
      where: {
        id: id
      }
    });
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get enrolled participants

const getEnrolledParticipants = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  try {
    const enrolledParticipants = await prisma.course
      .findUnique({
        where: { id: courseId },
        include: { participants: true },
      })
      .then((course) => course?.participants || []);

    res.status(200).json({ enrolledParticipants });
  } catch (error) {
    console.error('Error getting enrolled participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export {
  createTeacher,
  getTeachers,
  deleteTeacherById,
  getTeacherById,
  getEnrolledParticipants
}