import express from 'express';
import { getStudents, deleteById, verifyStudent } from '../controllers/studentController';
import { createUser } from '../controllers/createUser';
import { enrollToCourse, unEnrollFromCourse, enrolledCourses } from '../controllers/courseController/enroll';


const router = express.Router();

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

router.post('/verify/:userId/:tokenId', verifyStudent);

router.get('/:studentId/enrolled-courses', enrolledCourses);
router.post('/:studentId/enroll/:courseId', enrollToCourse);
router.post('/:studentId/unenroll/:courseId', unEnrollFromCourse);

export default router;