import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();



const enrolledCourses = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  try {
    const courses = await prisma.course.findMany({
      where: {
        participants: {
          some: {
            id: studentId
          }
        }
      }
    });

    res.status(200).json(courses);
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ error: 'Internal server error' });
  }
}

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
    const course = await prisma.course.update({
      where: { id: courseId },
      data: { participants: { connect: { id: studentId } } },
      include: { participants: true }, // Include the updated list of participants in the response
    });

    res.status(200).json({ message: 'Student enrolled successfully', course });

  } catch (error) {
    console.log("error", error)
    res.status(500).json({ error: 'Internal server error' });
  }
}


const unEnrollFromCourse = async (req: Request, res: Response) => {
  const { studentId, courseId } = req.params;

  try {

    // Check if the student and course exist
    const studentExists = await prisma.student.findUnique({ where: { id: studentId } });
    const courseExists = await prisma.course.findUnique({ where: { id: courseId } });

    if (!studentExists || !courseExists) {
      return res.status(404).json({ error: 'Student or course not found' });
    }

    // unEnroll the student in the course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: { participants: { disconnect: { id: studentId } } },
      include: { participants: true }
    });

    res.status(200).json({ message: 'Student unenrolled successfully', course });

  } catch (error) {
    console.log("error", error)
    res.status(500).json({ error: 'Internal server error' });
  }
}

export {
  enrolledCourses,
  enrollToCourse,
  unEnrollFromCourse
}