import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();


const getStudentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUniqueOrThrow({
      where: {
        id: id
      },
      include: {
        progress: true,
        enrolledCourses: true,
      }
    });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}


const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, firstName, lastName, imageUrl, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedStudent = await prisma.student.update({
      where: {
        id: id
      },
      data: {
        username: username,
        firstName: firstName,
        lastName: lastName,
        imageUrl: imageUrl,
        password: hashedPassword
      }
    })

    res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

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

  // res.status(200).json({ message: 'Verification successful' });
  res.redirect('http://localhost:5173/login')
  console.log(student)
}


// progress

const getChapterProgress = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { chapterId } = req.body;

  try {
    const student = await prisma.student.findUniqueOrThrow({
      where: {
        id: studentId
      }
    });

    const chapter = await prisma.chapter.findUniqueOrThrow({
      where: {
        id: chapterId
      }
    });

    if (!student || !chapter) {
      return res.status(404).json({ error: 'Data not found' });
    }

    const progress = await prisma.studentProgress.findMany({
      where: {
        studentId: studentId,
        chapterId: chapterId
      },
      include: {
        chapter: true,
        Student: true
      }
    });

    res.status(200).json({ progress });

  } catch (error) {
    console.error('Error fetching progress:', error);
  }
}

const trackCourseProgress = async (req: Request, res: Response) => {

  const { studentId, chapterId } = req.params;
  const { isCompleted } = req.body;
  console.log("==================")
  console.log(studentId, chapterId, isCompleted)
  try {
    const student = await prisma.student.findUniqueOrThrow({
      where: {
        id: studentId
      }
    });

    const chapter = await prisma.chapter.findUniqueOrThrow({
      where: {
        id: chapterId
      }
    });


    console.log(student.id, chapter.id)

    if (!student || !chapter) {
      console.log("==================")
      console.log(studentId, chapterId, isCompleted)
      return res.status(404).json({ error: 'Data not found' });
    }

    await prisma.studentProgress.create({
      data: {
        studentId: studentId,
        chapterId: chapterId,
        isCompleted: isCompleted
      }
    });

    res.status(200).json({ message: 'Progress tracked successfully' });

  } catch (error) {
    console.error('Error tracking progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const unTrackCourseProgress = async (req: Request, res: Response) => {

  const { studentId, chapterId, isCompleted } = req.body;

  try {
    const student = await prisma.student.findUniqueOrThrow({
      where: {
        id: studentId
      }
    });

    const course = await prisma.chapter.findUniqueOrThrow({
      where: {
        id: chapterId
      }
    });

    if (!student || !course) {
      return res.status(404).json({ error: 'Data not found' });
    }

    await prisma.studentProgress.update({
      where: {
        studentId_chapterId: {
          studentId: studentId,
          chapterId: chapterId
        }
      },
      data: {
        isCompleted: isCompleted
      }
    })

    res.status(200).json({ message: 'Progress untracked successfully' });

  } catch (error) {
    console.error('Error untracking progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export {
  getStudents,
  getStudentById,
  deleteById,
  verifyStudent,
  updateStudent,
  getChapterProgress,
  trackCourseProgress,
  unTrackCourseProgress
}
