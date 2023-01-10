import { fileController } from './file.controller';
import { Router } from 'express';
import requreAuth from '../../middlewares/requireAuth.middleware';

const router = Router();

router.post('/upload', fileController.upload);

export default router;
