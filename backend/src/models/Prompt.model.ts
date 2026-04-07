import mongoose, { Schema, Document } from 'mongoose';

export interface IPrompt extends Document {
  name: string;
  systemPrompt: string;
  userPrompt: string;
  description?: string;
  version: number;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const PromptSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  systemPrompt: { type: String, required: true },
  userPrompt: { type: String, required: true },
  description: { type: String },
  version: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: true
});

PromptSchema.index({ name: 1, version: 1 }, { unique: true });
PromptSchema.index({ name: 1, isActive: 1 });

export default mongoose.model<IPrompt>('Prompt', PromptSchema);