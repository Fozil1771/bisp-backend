import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const createCourse = async (req: Request, res: Response) => {
  const { title, banner, type, limit, view, price, teacherId, categoryId } = req.body;

  try {
    const course = await prisma.course.create({
      data: {
        title,
        banner,
        type,
        limit,
        view,
        price,
        teacherId,
        categoryId
      },
      include: {
        teacher: true,
        chapters: true
      }
    })

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, banner, type, limit, view, price, teacherId } = req.body;

  try {
    const updatedCourse = await prisma.course.update({
      where: {
        id: id
      },
      data: {
        title,
        banner,
        type,
        limit,
        view,
        price,
        teacherId
      },
      include: {
        teacher: true,
        chapters: true
      }
    });

    res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUniqueOrThrow({
      where: {
        id: id
      },
      include: {
        chapters: true,
        participants: true
      }
    });

    res.json(course);
  } catch (error) {
    res.send(404).json({ error: "No data found" })
  }
}

const deleteCourseById = async (req: Request, res: Response) => {
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
}



export {
  createCourse,
  updateCourse,
  getCourseById,
  deleteCourseById
}