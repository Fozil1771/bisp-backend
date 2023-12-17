import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createCourse = async (req: Request, res: Response) => {
  const { title, type, limit, view, teacherId } = req.body;

  try {
    const createdCourse = await prisma.course.create({
      data: {
        title,
        type,
        limit,
        view,
        teacher: { connect: { id: teacherId } },
      },
    });

    res.status(201).json({ message: 'Course created successfully', course: createdCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany();
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export {
  createCourse,
  getCourses
}