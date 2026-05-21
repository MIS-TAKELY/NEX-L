import express from 'express';
import { uploadMedia } from '../controllers/media.controller.js';
import { upload } from '../utils/cloudinary.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/upload', requireAuth, upload.single('file'), uploadMedia);

export default router;
