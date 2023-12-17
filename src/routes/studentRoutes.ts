import express from 'express';
import { createStudent, getStudents, enrollToCourse } from '../controllers/studentController';

const router = express.Router();

router.post('/', createStudent);
router.get('/', getStudents);

router.post('/:studentId/enroll/:courseId', enrollToCourse);

export default router;