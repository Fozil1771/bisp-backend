import express, { Request, Response, NextFunction } from 'express';
import { getStudents, deleteById, verifyStudent, updateStudent } from '../controllers/studentController';
import { createUser } from '../controllers/createUser';
import { enrollToCourse, unEnrollFromCourse, enrolledCourses } from '../controllers/courseController/enroll';
import jwt, { sign } from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'

import { PrismaClient } from '@prisma/client';
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const prisma = new PrismaClient();

const router = express.Router();


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


router.post('/', async (req, res) => {
  try {
    const userType: string = "STUDENT"
    const createdUser = await createUser(req.body, userType);
    res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

router.get('/', getStudents);

router.delete('/:id', deleteById)

router.get('/verify/:userId/:tokenId', verifyStudent);

router.get('/:studentId/enrolled-courses', enrolledCourses);
router.post('/:studentId/enroll/:courseId', enrollToCourse);
router.post('/:studentId/unenroll/:courseId', unEnrollFromCourse);

router.post('/update/:id', updateStudent);

router.post('/image', upload, renameFileWithUniqueTitle, (req: Request, res: Response) => {
  console.log(req.body)
  res.send("File uploaded")
});

interface RequestWitSession extends Request {
  session: any;
}

router.post('/login', async (req: RequestWitSession, res, next) => {
  const { username, email, password } = req.body;

  try {

    let user = await prisma.student.findUniqueOrThrow({
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


router.post("/:studentId/create-checkout-session", async (req, res) => {
  console.log(req.body.item)
  const item = req.body.item;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.title,
            },
            unit_amount: item.price,
          },
        }
      ],
      success_url: `/`,
      cancel_url: `/`,
    })

    res.json({ url: session.url })
  } catch (error) {
    res.status(500).json({ error: error })
  }
})

export default router;