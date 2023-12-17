import express from 'express';
const router = express.Router();
import { verifyTeacher, getAllAdmins, createAdmin, getAdminById, deleteById } from '../controllers/adminController';

// Define your routes here

router.get('/:id', getAdminById);

router.get('/', getAllAdmins);

router.post('/', createAdmin);

router.delete('/:id', deleteById)

router.post('/verify-teacher/:teacherId', verifyTeacher);

export default router;