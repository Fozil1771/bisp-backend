import express from 'express';
import { authenticateToken } from '../auth';
import { createCourse, deleteById, getCourses, getCourseById } from '../controllers/courseController';

const router = express.Router();


router.get('/:id', authenticateToken, getCourseById);
router.get('/', authenticateToken, getCourses);
router.post('/', createCourse);
router.delete('/:id', deleteById);

export default router;
