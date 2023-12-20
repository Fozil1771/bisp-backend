import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createCourse = async (req: Request, res: Response) => {
  const { title, type, limit, view } = req.body;

  // @ts-ignore
  const teacher = req.teacher;

  try {
    const createdCourse = await prisma.course.create({
      data: {
        title,
        type,
        limit,
        view,
        teacherId: teacher.id
      },
      include: {
        teacher: true
      }
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

const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUniqueOrThrow({
      where: {
        id: id
      },
      include: {
        teacher: true
      }
    });

    res.json(course);
  } catch (error) {
    res.send(404).json({ error: "No data found" })
  }
}


const deleteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.course.delete({
      where: {
        id: id
      }
    });
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  createCourse,
  getCourses,
  getCourseById,
  deleteById
}