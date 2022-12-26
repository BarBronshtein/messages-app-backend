import { Router } from 'express';
import requreAuth from '../../middlewares/requireAuth.middleware';
import * as fileController from './file.controller';
const router = Router();

router.get('/:id', fileController.getFile);
