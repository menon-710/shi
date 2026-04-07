import express from 'express';
import {
  getSessions, getSession, createSession,
  sendChatMessage, deleteSession, archiveSession
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.get('/sessions/:id', getSession);
router.delete('/sessions/:id', deleteSession);
router.patch('/sessions/:id/archive', archiveSession);
router.post('/send', sendChatMessage);

export default router;
