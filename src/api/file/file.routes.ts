import { fileController } from './file.controller';
import { Router } from 'express';
import requreAuth from '../../middlewares/requireAuth.middleware';

const router = Router();

router.get('/:id', fileController.get);
router.post('/upload', fileController.upload);

export default router;
