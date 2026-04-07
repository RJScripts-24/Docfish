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
  private getOwnerScope(userId?: string) {
    return { createdBy: userId || null };
  }

  private getAccessibleScope(userId?: string) {
    if (userId) {
      return { $or: [{ createdBy: userId }, { createdBy: null }] };
    }

    return { createdBy: null };
  }

  private async ensureUniversalDefaultPrompt(name = 'invoice_extraction') {
    const existingUniversal = await Prompt.findOne({ name, createdBy: null, isActive: true }).sort({ version: -1 });

    if (existingUniversal) {
      return existingUniversal;
    }

    const latestPromptForName = await Prompt.findOne({ name }).sort({ version: -1 }).lean();
    const nextVersion = latestPromptForName ? Number(latestPromptForName.version || 0) + 1 : 1;

    return Prompt.create({
      name,
      version: nextVersion,
      systemPrompt:
        'You extract invoice data into structured JSON with strong field fidelity.',
      userPrompt:
        'Extract vendor_name, invoice_number, invoice_date, currency, total_amount, tax_amount, and line_items from the provided invoice text. Return JSON only.',
      description: 'Universal default invoice extraction prompt',
      isActive: true,
      createdBy: null,
    });
  }

  async createPromptVersion(input: CreatePromptInput) {
    const ownerScope = this.getOwnerScope(input.createdBy);
    const latestPrompt = await Prompt.findOne({ name: input.name })
      .sort({ version: -1 })
      .lean();

    const nextVersion = latestPrompt ? latestPrompt.version + 1 : 1;

    if (input.isActive) {
      await Prompt.updateMany(
        { name: input.name, isActive: true, ...ownerScope },
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
      ...ownerScope,
    });

    return prompt;
  }

  async listPromptVersions(name?: string, userId?: string) {
    await this.ensureUniversalDefaultPrompt(name || 'invoice_extraction');
    const accessibleScope = this.getAccessibleScope(userId);
    const query = name ? { ...accessibleScope, name } : accessibleScope;
    return Prompt.find(query).sort({ createdBy: 1, name: 1, version: -1 });
  }

  async getPromptById(promptId: string, userId?: string) {
    const accessibleScope = this.getAccessibleScope(userId);
    const prompt = await Prompt.findOne({ _id: promptId, ...accessibleScope });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    return prompt;
  }

  async getOwnedPromptById(promptId: string, userId?: string) {
    const ownerScope = this.getOwnerScope(userId);
    const prompt = await Prompt.findOne({ _id: promptId, ...ownerScope });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    return prompt;
  }

  async getActivePrompt(name = 'invoice_extraction', userId?: string) {
    await this.ensureUniversalDefaultPrompt(name);
    const ownerScope = this.getOwnerScope(userId);

    let prompt = await Prompt.findOne({ name, isActive: true, ...ownerScope }).sort({
      version: -1,
    });

    if (!prompt && userId) {
      prompt = await Prompt.findOne({ name, isActive: true, createdBy: null }).sort({
        version: -1,
      });
    }

    if (!prompt) {
      prompt = await Prompt.findOne({ isActive: true, ...ownerScope }).sort({
        updatedAt: -1,
      });
    }

    if (!prompt && userId) {
      prompt = await Prompt.findOne({ isActive: true, createdBy: null }).sort({
        updatedAt: -1,
      });
    }

    if (!prompt) {
      try {
        prompt = await this.ensureUniversalDefaultPrompt(name);
      } catch (error: any) {
        if (error?.code !== 11000) {
          throw error;
        }

        prompt = await Prompt.findOne({ name, createdBy: null }).sort({ version: -1 });

        if (!prompt) {
          throw error;
        }
      }
    }

    return prompt;
  }

  async activatePrompt(promptId: string, userId?: string) {
    const prompt = await this.getOwnedPromptById(promptId, userId);
    const ownerScope = this.getOwnerScope(userId);

    await Prompt.updateMany(
      { name: prompt.name, isActive: true, ...ownerScope },
      { $set: { isActive: false } }
    );

    prompt.isActive = true;
    await prompt.save();

    return prompt;
  }

  async updatePrompt(promptId: string, input: UpdatePromptInput, userId?: string) {
    const prompt = await this.getOwnedPromptById(promptId, userId);
    const ownerScope = this.getOwnerScope(userId);

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
        { name: prompt.name, isActive: true, _id: { $ne: prompt._id }, ...ownerScope },
        { $set: { isActive: false } }
      );
    }

    if (typeof input.isActive === 'boolean') {
      prompt.isActive = input.isActive;
    }

    await prompt.save();

    return prompt;
  }

  async deletePrompt(promptId: string, userId?: string) {
    const prompt = await this.getOwnedPromptById(promptId, userId);
    const ownerScope = this.getOwnerScope(userId);
    await Prompt.findOneAndDelete({ _id: promptId, ...ownerScope });
    return prompt;
  }
}

export default new PromptService();