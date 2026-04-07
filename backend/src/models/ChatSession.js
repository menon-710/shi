import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    symptoms: [String],
    urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'emergency', ''] },
    topicsDiscussed: [String]
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Conversation' },
  messages: [messageSchema],
  summary: { type: String, default: '' },
  tags: [{ type: String }],
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

chatSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Auto-generate title from first user message
chatSessionSchema.methods.generateTitle = function () {
  const firstUserMsg = this.messages.find(m => m.role === 'user');
  if (firstUserMsg) {
    this.title = firstUserMsg.content.substring(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '');
  }
};

export default mongoose.model('ChatSession', chatSessionSchema);
