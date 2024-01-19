import express from 'express';
import { authenticateToken } from '../auth';
import { createCourse, deleteCourseById, getCourseById, getCourseList, getCoursePublicById, updateCourse } from '../controllers/courseController/course';
import { createChapter, deleteChapterById } from '../controllers/courseController/chapter';

const router = express.Router();

router.get('/:id', getCoursePublicById);

router.get('/', getCourseList);

router.get('/:teacherId/:id', authenticateToken, getCourseById);

router.post('/', authenticateToken, createCourse);
router.put('/:teacherId/update/:courseId', authenticateToken, updateCourse);

router.delete('/:id', authenticateToken, deleteCourseById);

router.post('/:teacherId/:courseId', authenticateToken, createChapter);
router.delete('/:teacherId/:courseId/chapter/:chapterId', authenticateToken, deleteChapterById);


export default router;
