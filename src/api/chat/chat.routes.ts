import { Router } from 'express';
import requreAuth from '../../middlewares/requireAuth.middleware';
import * as chatController from './chat.controller';
const router = Router();

// Middleware that is specific to this router
router.use(requreAuth);

router.get('/', chatController.getChats);
router.get('/:id', chatController.getChatById);
router.put('/message/:id', chatController.addMessage);
router.put('/:id', chatController.updateChat);
router.post('/', chatController.addChat);

export default router;
