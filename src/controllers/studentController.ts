import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createStudent = async (req: Request, res: Response) => {
  const { firstName, lastName, email } = req.body;

  try {
    const createdStudent = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
      },
    });

    res.status(201).json({ message: 'Student created successfully', student: createdStudent });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Enroll to the course

const enrollToCourse = async (req: Request, res: Response) => {
  const { studentId, courseId } = req.params;

  try {
    // Check if the student and course exist
    const studentExists = await prisma.student.findUnique({ where: { id: studentId } });
    const courseExists = await prisma.course.findUnique({ where: { id: courseId } });

    if (!studentExists || !courseExists) {
      return res.status(404).json({ error: 'Student or course not found' });
    }

    // Enroll the student in the course
    const enrolledStudent = await prisma.course.update({
      where: { id: courseId },
      data: { participants: { connect: { id: studentId } } },
      include: { participants: true }, // Include the updated list of participants in the response
    });

    res.status(200).json({ message: 'Student enrolled successfully', enrolledStudent });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export {
  createStudent,
  getStudents,
  enrollToCourse
}
