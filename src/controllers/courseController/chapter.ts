import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();



const createChapter = async (req: Request, res: Response) => {

  const { courseId, teacherId } = req.params

  const { title, description, isPublished, isFree } = req.body;

  try {

    const courseOwner = await prisma.course.findUnique({
      where: {
        id: courseId,
        teacherId: teacherId
      },
    });

    if (!courseOwner) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const lastChapter = await prisma.chapter.findFirst({
      where: {
        courseId: courseId,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const createdChapter = await prisma.chapter.create({
      data: {
        title,
        description: description,
        position: newPosition,
        isPublished,
        isFree,
        courseId
      },
      include: {
        course: {
          include: {
            chapters: true
          }
        }
      }
    })
    res.status(201).json(createdChapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const deleteChapterById = async (req: Request, res: Response) => {
  const { chapterId } = req.params;
  try {
    await prisma.chapter.delete({
      where: {
        id: chapterId
      }
    });
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}


export {
  createChapter,
  deleteChapterById
}