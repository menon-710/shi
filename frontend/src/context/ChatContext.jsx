import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { CHAT_API_ROOT } from '../config/api.js';

const ChatContext = createContext();
const API = CHAT_API_ROOT;

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/sessions`);
      setSessions(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadSession = useCallback(async (sessionId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/sessions/${sessionId}`);
      setActiveSession(data);
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewSession = useCallback(() => {
    setActiveSession(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (content) => {
    const userMsg = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    try {
      const { data } = await axios.post(`${API}/send`, {
        message: content,
        sessionId: activeSession?._id || null
      });
      if (!activeSession) {
        setActiveSession({ _id: data.sessionId, title: data.title });
      }
      setMessages(prev => [...prev, data.message]);
      await fetchSessions();
      return data;
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setSending(false);
    }
  }, [activeSession, fetchSessions]);

  const deleteSession = useCallback(async (sessionId) => {
    await axios.delete(`${API}/sessions/${sessionId}`);
    if (activeSession?._id === sessionId) startNewSession();
    await fetchSessions();
  }, [activeSession, fetchSessions, startNewSession]);

  return (
    <ChatContext.Provider value={{
      sessions, activeSession, messages, loading, sending,
      fetchSessions, loadSession, startNewSession, sendMessage, deleteSession
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
