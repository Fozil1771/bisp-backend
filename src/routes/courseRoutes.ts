import express from 'express';
import { authenticateToken } from '../auth';
import { createCourse, deleteCourseById, getCourseById } from '../controllers/courseController/course';
import { createChapter } from '../controllers/courseController/chapter';

const router = express.Router();


router.get('/:id', authenticateToken, getCourseById);
router.post('/', authenticateToken, createCourse);
router.delete('/:id', authenticateToken, deleteCourseById);

router.post('/:teacherId/:courseId', authenticateToken, createChapter);

export default router;
