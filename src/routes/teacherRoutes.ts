import express from 'express';
import { createTeacher, getTeachers, deleteTeacherById, getTeacherById, getEnrolledParticipants } from '../controllers/teacherController';

const router = express.Router();

router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.get('/:courseId/enrolled-participants', getEnrolledParticipants);

router.post('/', createTeacher);
router.delete('/:id', deleteTeacherById);



export default router;