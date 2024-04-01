import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const getCourseList = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany();
    console.log(courses)
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const createCourse = async (req: Request, res: Response) => {
  const { title, description, banner, type, limit, view, price, teacherId, categoryName } = req.body;

  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        banner,
        type,
        limit,
        view,
        price,
        teacherId,
        categoryName
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

    res.sendStatus(200).json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const getCoursePublicById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUniqueOrThrow({
      where: {
        id: id
      },
      include: {
        chapters: true,
        participants: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(200).json(course);
  } catch (error) {
    res.status(404).json({ error: "No data found" })
  }
}

const getCourseById = async (req: Request, res: Response) => {
  const { teacherId, id } = req.params;
  console.log(id)
  try {
    const course = await prisma.course.findUniqueOrThrow({
      where: {
        id: id,
        teacherId: teacherId
      },
      include: {
        chapters: true,
        participants: true
      }
    });
    console.log("by id protected: ", course)
    res.status(200).json(course);
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
  getCourseList,
  getCoursePublicById,
  createCourse,
  updateCourse,
  getCourseById,
  deleteCourseById
}