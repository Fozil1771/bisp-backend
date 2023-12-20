import express from 'express';
import { createStudent, getStudents, enrollToCourse, deleteById } from '../controllers/studentController';


const router = express.Router();

router.post('/', createStudent);
router.get('/', getStudents);

router.delete('/:id', deleteById)

router.post('/:studentId/enroll/:courseId', enrollToCourse);

export default router;