import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// // Enroll to the course

// const enrollToCourse = async (req: Request, res: Response) => {
//   const { studentId, courseId } = req.params;

//   try {
//     // Check if the student and course exist
//     const studentExists = await prisma.student.findUnique({ where: { id: studentId } });
//     const courseExists = await prisma.course.findUnique({ where: { id: courseId } });

//     if (!studentExists || !courseExists) {
//       return res.status(404).json({ error: 'Student or course not found' });
//     }

//     // Enroll the student in the course
//     const enrolledStudent = await prisma.course.update({
//       where: { id: courseId },
//       data: { participants: { connect: { id: studentId } } },
//       include: { participants: true }, // Include the updated list of participants in the response
//     });

//     res.status(200).json({ message: 'Student enrolled successfully', enrolledStudent });
//   } catch (error) {
//     console.error('Error enrolling student:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

const deleteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.student.delete({
      where: {
        id: id
      }
    });
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyStudent = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const tokenId = req.params.tokenId;

  console.log(userId, tokenId)
  console.log("verified")

  const student = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    }
  });

  const token = await prisma.token.findUniqueOrThrow({
    where: {
      id: Number(tokenId)
    }
  });

  if (!student || !token) {
    return res.status(404).json({ error: 'Data not found' });
  }

  if (token.userId !== student.id) {
    return res.status(401).json({ error: 'Invalid token for the student' });
  }

  if (!token.valid || token.expiration < new Date()) {
    return res.status(401).json({ error: 'Token expired' });
  }

  await prisma.student.update({
    where: { id: student.id },
    data: { verified: true }
  });

  await prisma.token.update({
    where: { id: token.id },
    data: { valid: false }
  })

  res.status(200).json({ message: 'Verification successful' });
  console.log(student)
}


export {
  getStudents,
  deleteById,
  verifyStudent
}
