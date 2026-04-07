import Prompt from '../models/Prompt.model';

export interface CreatePromptInput {
  name: string;
  systemPrompt: string;
  userPrompt: string;
  description?: string;
  isActive?: boolean;
  createdBy?: string;
}

export interface UpdatePromptInput {
  name?: string;
  systemPrompt?: string;
  userPrompt?: string;
  description?: string;
  isActive?: boolean;
}

class PromptService {
  async createPromptVersion(input: CreatePromptInput) {
    const latestPrompt = await Prompt.findOne({ name: input.name })
      .sort({ version: -1 })
      .lean();

    const nextVersion = latestPrompt ? latestPrompt.version + 1 : 1;

    if (input.isActive) {
      await Prompt.updateMany(
        { name: input.name, isActive: true },
        { $set: { isActive: false } }
      );
    }

    const prompt = await Prompt.create({
      name: input.name,
      version: nextVersion,
      systemPrompt: input.systemPrompt,
      userPrompt: input.userPrompt,
      description: input.description || '',
      isActive: input.isActive ?? true,
      createdBy: input.createdBy || null,
    });

    return prompt;
  }

  async listPromptVersions(name?: string) {
    const query = name ? { name } : {};
    return Prompt.find(query).sort({ name: 1, version: -1 });
  }

  async getPromptById(promptId: string) {
    const prompt = await Prompt.findById(promptId);

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    return prompt;
  }

  async getActivePrompt(name = 'invoice_extraction') {
    let prompt = await Prompt.findOne({ name, isActive: true }).sort({
      version: -1,
    });

    if (!prompt) {
      prompt = await Prompt.findOne({ isActive: true }).sort({
        updatedAt: -1,
      });
    }

    if (!prompt) {
      try {
        prompt = await Prompt.create({
          name,
          version: 1,
          systemPrompt:
            'You extract invoice data into structured JSON with strong field fidelity.',
          userPrompt:
            'Extract vendor_name, invoice_number, invoice_date, currency, total_amount, tax_amount, and line_items from the provided invoice text. Return JSON only.',
          description: 'Default invoice extraction prompt',
          isActive: true,
        });
      } catch (error: any) {
        if (error?.code !== 11000) {
          throw error;
        }

        prompt = await Prompt.findOne({ name }).sort({ version: -1 });

        if (!prompt) {
          throw error;
        }
      }
    }

    return prompt;
  }

  async activatePrompt(promptId: string) {
    const prompt = await this.getPromptById(promptId);

    await Prompt.updateMany(
      { name: prompt.name, isActive: true },
      { $set: { isActive: false } }
    );

    prompt.isActive = true;
    await prompt.save();

    return prompt;
  }

  async updatePrompt(promptId: string, input: UpdatePromptInput) {
    const prompt = await this.getPromptById(promptId);

    if (typeof input.name === 'string') {
      prompt.name = input.name;
    }

    if (typeof input.systemPrompt === 'string') {
      prompt.systemPrompt = input.systemPrompt;
    }

    if (typeof input.userPrompt === 'string') {
      prompt.userPrompt = input.userPrompt;
    }

    if (typeof input.description === 'string') {
      prompt.description = input.description;
    }

    if (typeof input.isActive === 'boolean' && input.isActive) {
      await Prompt.updateMany(
        { name: prompt.name, isActive: true, _id: { $ne: prompt._id } },
        { $set: { isActive: false } }
      );
    }

    if (typeof input.isActive === 'boolean') {
      prompt.isActive = input.isActive;
    }

    await prompt.save();

    return prompt;
  }

  async deletePrompt(promptId: string) {
    const prompt = await this.getPromptById(promptId);
    await Prompt.findByIdAndDelete(promptId);
    return prompt;
  }
}

export default new PromptService();