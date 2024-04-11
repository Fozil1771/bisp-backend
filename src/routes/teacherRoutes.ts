import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises'
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../auth';
import jwt, { sign } from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import path from 'path';

import { createUser } from '../controllers/createUser';
import { getTeachers, deleteTeacherById, updateTeacher, getTeacherById, getEnrolledParticipants, getAllCourses, verifyTeacher } from '../controllers/teacherController';
import multer from 'multer';


const JWT_SECRET = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcwMjg1ODcyNSwiaWF0IjoxNzAyODU4NzI1fQ.vCVu2XCpeE_vhtBCn1ryV2SU8ediTWbmuti7FWv6uVE" //process.env.JWT_SECRET;

const router = express.Router();
const prisma = new PrismaClient();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/profile')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const uploadsDir = path.resolve('./public/profile')
const renameFileWithUniqueTitle = async (req: any, res: any, next: NextFunction) => {
  try {
    const oldPath = path.join(uploadsDir, req?.file?.filename);
    const uniqueTitle = req?.body?.username;
    console.log(uniqueTitle)
    const newPath = path.join(uploadsDir, `${uniqueTitle.split(" ").join("_")
      }_avatar.jpg`);

    // Use fs.promises to rename the file asynchronously
    await fs.rename(oldPath, newPath);

    // Update req.file.filename to reflect the new name for further processing
    req.file.filename = `${uniqueTitle.split(" ").join("_")}_avatar.jpg`;
    next();
  } catch (error) {
    console.error('Error renaming file:', error);
    return res.status(500).send("Error renaming file");
  }
};

const upload = multer({ storage, limits: { fileSize: 1576954 } }).single('imageUrl');


router.get('/:id', getTeacherById);
router.get('/', getTeachers);
// router.get('/:courseId/enrolled-participants', getEnrolledParticipants);

router.get('/:teacherId/enrolled-participants', getEnrolledParticipants);
router.get('/:teacherId/courses', getAllCourses);

router.post('/', async (req, res) => {
  try {
    const userType: string = "TEACHER"
    const createdUser = await createUser(req.body, userType);
    res.status(201).send(createdUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});
router.delete('/:id', deleteTeacherById);

router.get('/verify/:userId/:tokenId', verifyTeacher);

router.post('/update/:id', updateTeacher);

router.post('/image', upload, renameFileWithUniqueTitle, (req: Request, res: Response) => {
  console.log(req.body)
  res.send("File uploaded")
});


// Generate a random 8 digit number as the email token
function generateEmailToken(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateAuthToken(tokenId: number): string {
  const jwtPayload = { tokenId };

  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: 'HS256',
    noTimestamp: true,
  });
}

interface RequestWitSession extends Request {
  session: any;
  // Add other custom properties as needed
}


router.post('/login', async (req: RequestWitSession, res, next) => {
  const { username, email, password } = req.body;

  try {

    let user = await prisma.teacher.findUniqueOrThrow({
      where: {
        email,
        username
      }
    })

    console.log(user)

    if (!user) {
      // User not found
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(401).json({ error: 'Unverified' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    const token = sign({ userId: user.id }, 'your-secret-key', {
      expiresIn: '1d', // Adjust the expiration time as needed
    });

    if (passwordMatch) {
      // Passwords match, send user data
      req.session.user = { user, token };

      res.setHeader(
        'Set-Cookie',
        `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=None; Secure`
      );

      return res.status(200).json(req.session.user);

    } else {
      // Passwords do not match
      return res.status(401).json({ error: 'Invalid credentials' });
    }


  } catch (error) {
    res
      .status(400)
      .json({ error: "Couldn't start the authentication process" });
  }
});

router.post('/logout', (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});


// Validate the emailToken
// Generate a long-lived JWT token
// router.post('/auth', async (req, res) => {
//   const { email, emailToken, password } = req.body;

//   const dbEmailToken = await prisma.token.findUnique({
//     where: {
//       emailToken,
//     },
//     include: {
//       user: true
//     },
//   });

//   if (!dbEmailToken || !dbEmailToken.valid) {
//     return res.sendStatus(401);
//   }

//   if (dbEmailToken.expiration < new Date()) {
//     return res.status(401).json({ error: 'Token expired!' });
//   }

//   const user = dbEmailToken.user

//   if (!user || user.email !== email) {
//     return res.sendStatus(401);
//   }

//   // Here we validated that the user is the owner of the email

//   // generate an API token
//   const expiration = new Date(
//     new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000
//   );

//   const createdToken = await prisma.token.create({
//     data: {
//       emailToken,
//       expiration,
//       teacher: {
//         connectOrCreate: {
//           where: { email },
//           create: {
//             email,
//             password
//           },
//         },
//       },
//     },
//   });


//   // generate the JWT token
//   const authToken = generateAuthToken(createdToken.id);

//   res.json({ authToken });
// });

export default router;