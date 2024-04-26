import express, { Request as ExpressRequest, Response, NextFunction, Request } from 'express';
import { verifiedTeacherByAdmin, getAllAdmins, getAdminById, deleteById, verifyAdmin } from '../controllers/adminController';
import { authenticateToken } from '../auth'
import { PrismaClient } from '@prisma/client';
import jwt, { sign } from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { Session } from 'express-session';
import { createUser } from '../controllers/createUser';

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER SECRET';


const router = express.Router();
const prisma = new PrismaClient();



router.get('/:id', getAdminById);

router.get('/', getAllAdmins);


router.post('/', async (req, res) => {
  try {
    const userType: string = "ADMIN"
    const createdUser = await createUser(req.body, userType);
    res.status(201).send(createdUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

router.delete('/:id', deleteById);


router.get('/verify/:userId/:tokenId', verifyAdmin);

router.post('/verify-teacher/:teacherId', verifiedTeacherByAdmin);




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
  const { email, password } = req.body;

  try {

    let user = await prisma.admin.findUniqueOrThrow({
      where: {
        email
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
// router.post('/authenticate', async (req, res) => {
//   const { email, emailToken } = req.body;

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
//   const apiToken = await prisma.token.create({
//     data: {
//       expiration,
//       admin: {
//         connect: {
//           email
//         }
//       },
//     },
//   });

//   // Invalidate the email
//   await prisma.token.update({
//     where: { id: dbEmailToken.id },
//     data: { valid: false },
//   });

//   // generate the JWT token
//   const authToken = generateAuthToken(apiToken.id);

//   res.json({ authToken });
// });

export default router;