import mongoose, { Schema, Document } from 'mongoose';

export interface IPrompt extends Document {
  content: string;
  description?: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromptSchema: Schema = new Schema({
  content: { type: String, required: true },
  description: { type: String },
  version: { type: Number, required: true, unique: true },
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IPrompt>('Prompt', PromptSchema);