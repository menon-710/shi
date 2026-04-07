import ChatSession from '../models/ChatSession.js';
import { sendMessage, extractMetadata } from '../config/gemini.js';

// Get all chat sessions for user
export const getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id, isArchived: false })
      .select('title tags createdAt updatedAt messages')
      .sort({ updatedAt: -1 });

    const sessionsWithCount = sessions.map(s => ({
      _id: s._id,
      title: s.title,
      tags: s.tags,
      messageCount: s.messages.length,
      lastMessage: s.messages[s.messages.length - 1]?.content?.substring(0, 80) || '',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }));

    res.json(sessionsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single session with all messages
export const getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new session
export const createSession = async (req, res) => {
  try {
    const session = await ChatSession.create({ userId: req.user._id });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message and get AI response
export const sendChatMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, userId: req.user._id });
      if (!session) return res.status(404).json({ message: 'Session not found' });
    } else {
      session = await ChatSession.create({ userId: req.user._id });
    }

    // Add user message
    session.messages.push({ role: 'user', content: message });

    // Fetch all past sessions for context (limit to last 10 for performance)
    const allHistory = await ChatSession.find({ userId: req.user._id, isArchived: false })
      .select('messages summary tags')
      .sort({ updatedAt: -1 })
      .limit(10);

    // Get AI response
    const aiText = await sendMessage(
      message,
      session.messages,
      req.user,
      allHistory
    );

    // Extract metadata asynchronously
    const metadata = await extractMetadata(message, aiText);

    // Add AI response
    session.messages.push({
      role: 'assistant',
      content: aiText,
      metadata
    });

    // Auto-generate title from first message
    if (session.messages.length === 2) {
      session.generateTitle();
    }

    await session.save();

    res.json({
      sessionId: session._id,
      title: session.title,
      message: {
        role: 'assistant',
        content: aiText,
        timestamp: new Date(),
        metadata
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to get AI response: ' + error.message });
  }
};

// Delete a session
export const deleteSession = async (req, res) => {
  try {
    await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Archive a session
export const archiveSession = async (req, res) => {
  try {
    await ChatSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isArchived: true }
    );
    res.json({ message: 'Session archived' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
