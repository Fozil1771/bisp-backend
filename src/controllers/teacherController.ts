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
        admin: true,
      },
    });

    res.json(teacher);
  } catch (error) {
    res.send(404).json({ error: "No data found" })
  }
}

// get all
const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        admin: true,
        courses: true
      }
    });
    res.status(200).json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// create teacher

// const createTeacher = async (req: Request, res: Response) => {
//   const { username, firstName, lastName, email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     const createdTeacher = await prisma.teacher.create({
//       data: {
//         username,
//         firstName,
//         lastName,
//         email,
//         password: hashedPassword
//       },
//     });

//     res.status(201).json({ message: 'Teacher created successfully', teacher: createdTeacher });
//   } catch (error) {
//     console.error('Error creating teacher:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

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
  const { teacherId } = req.params;

  try {
    // Find all courses for the teacher
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        participants: true,
      },
    });

    // Extract participants from all courses
    const allEnrolledParticipants = courses.flatMap((course) => course.participants || []);

    res.status(200).json(allEnrolledParticipants);
  } catch (error) {
    console.error('Error getting enrolled participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const getAllCourses = async (req: Request, res: Response) => {
  const { teacherId } = req.params;

  try {
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacherId
      }
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const updateTeacher = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, firstName, lastName, bio, imageUrl, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedTeacher = await prisma.teacher.update({
      where: {
        id: id
      },
      data: {
        username: username,
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        imageUrl: imageUrl,
        password: hashedPassword
      }
    })

    res.status(200).json({ message: 'Teacher updated successfully', teacher: updatedTeacher });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const verifyTeacher = async (req: Request, res: Response) => {
  const teacherId = req.params.userId;
  const tokenId = req.params.tokenId;

  console.log(req.params)

  console.log(teacherId, tokenId)
  console.log("verified")

  const teacher = await prisma.user.findUniqueOrThrow({
    where: {
      id: teacherId
    }
  });

  const token = await prisma.token.findUniqueOrThrow({
    where: {
      id: Number(tokenId)
    }
  });

  if (!teacher || !token) {
    return res.status(404).json({ error: 'Data not found' });
  }

  if (token.userId !== teacher.id) {
    return res.status(401).json({ error: 'Invalid token for the admin' });
  }

  if (!token.valid || token.expiration < new Date()) {
    return res.status(401).json({ error: 'Token expired' });
  }

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: { verified: true }
  });

  await prisma.token.update({
    where: { id: token.id },
    data: { valid: false }
  })

  res.redirect('http://localhost:5173/login')
  // res.redirect('http://localhost:5173/login-confirmed')
  console.log(teacher)
}


export {
  getTeachers,
  deleteTeacherById,
  getTeacherById,
  getEnrolledParticipants,
  getAllCourses,
  verifyTeacher,
  updateTeacher
}