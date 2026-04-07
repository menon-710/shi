import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  profile: {
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other', ''] },
    bloodGroup: { type: String },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedications: [{ type: String }],
    smokingStatus: { type: String, enum: ['never', 'former', 'current', ''] },
    alcoholConsumption: { type: String, enum: ['none', 'occasional', 'moderate', 'heavy', ''] },
    exerciseFrequency: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active', ''] },
    dietaryPreferences: [{ type: String }],
    familyHistory: [{ type: String }],
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
