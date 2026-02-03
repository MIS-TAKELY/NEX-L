import express from 'express';
import { uploadMedia } from '../controllers/media.controller.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadMedia);

export default router;
