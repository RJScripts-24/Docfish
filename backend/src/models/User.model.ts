import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string | null;
  isGuest?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false,
    default: null,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);