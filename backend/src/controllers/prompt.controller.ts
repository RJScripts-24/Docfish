import { Request, Response } from 'express';
import promptService from '../services/prompt.service';

export const createPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, systemPrompt, userPrompt, description, isActive } = req.body;
    
    if (!name || !systemPrompt || !userPrompt) {
      res.status(400).json({ error: 'name, systemPrompt, and userPrompt are required' });
      return;
    }

    const prompt = await promptService.createPromptVersion({
      name,
      systemPrompt,
      userPrompt,
      description,
      isActive,
      createdBy: req.user?.userId,
    });

    res.status(201).json(prompt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = typeof req.query.name === 'string' ? req.query.name : undefined;
    const prompts = await promptService.listPromptVersions(name);
    res.status(200).json(prompts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const activePrompt = await promptService.getActivePrompt();
    
    if (!activePrompt) {
      res.status(404).json({ error: 'No active prompt found' });
      return;
    }

    res.status(200).json(activePrompt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const activatePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const activatedPrompt = await promptService.activatePrompt(id);
    
    if (!activatedPrompt) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    res.status(200).json(activatedPrompt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};