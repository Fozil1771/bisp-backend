import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises'
import path from 'path'
import { authenticateToken } from '../auth';
import { createCourse, deleteCourseById, getCourseById, getCourseList, getCoursePublicById, updateCourse, getCourseRatings, createCourseRating, deleteCourseRating, editCourseRating } from '../controllers/courseController/course';
import { createChapter, deleteChapterById } from '../controllers/courseController/chapter';
import multer from 'multer';

const router = express.Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/course')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const uploadsDir = path.resolve('./public/course')
const renameFileWithUniqueTitle = async (req: any, res: any, next: NextFunction) => {
  try {
    const oldPath = path.join(uploadsDir, req?.file?.filename);
    const uniqueTitle = req?.body?.title; // Assume title is sent in req.body
    const newPath = path.join(uploadsDir, `${uniqueTitle.split(" ").join("_")
      }_banner.jpg`);

    // Use fs.promises to rename the file asynchronously
    await fs.rename(oldPath, newPath);

    // Update req.file.filename to reflect the new name for further processing
    req.file.filename = `${uniqueTitle.split(" ").join("_")}_banner.jpg`;
    next();
  } catch (error) {
    console.error('Error renaming file:', error);
    return res.status(500).send("Error renaming file");
  }
};

const upload = multer({ storage, limits: { fileSize: 1576954 } }).single('banner');

router.get('/:id', getCoursePublicById);
router.get('/', getCourseList);
router.get('/:teacherId/:id', authenticateToken, getCourseById);

router.post('/', authenticateToken, createCourse);
router.post('/image', upload, renameFileWithUniqueTitle, (req: Request, res: Response) => {
  console.log(req.body)
  res.send("File uploaded")
});


router.post('/:teacherId/:courseId', authenticateToken, createChapter);
router.post('/:courseId/:studentId/rating', createCourseRating);

router.put('/:teacherId/update/:courseId', authenticateToken, updateCourse);

router.delete('/:id', authenticateToken, deleteCourseById);
router.delete('/:teacherId/:courseId/chapter/:chapterId', authenticateToken, deleteChapterById);

router.get('/:courseId/ratings', getCourseRatings);
router.post('/:courseId/:studentId/rating', createCourseRating);

router.put('/:courseId/:studentId/rating/:id', deleteCourseRating);
router.delete('/:courseId/:studentId/rating/:id', editCourseRating);





export default router;
