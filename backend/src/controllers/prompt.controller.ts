import { Request, Response } from 'express';
import * as promptService from '../services/prompt.service';

export const createPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, description } = req.body;
    
    if (!content) {
      res.status(400).json({ error: 'Prompt content is required' });
      return;
    }

    const prompt = await promptService.createPromptVersion(content, description);
    res.status(201).json(prompt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const prompts = await promptService.getAllPrompts();
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
    const activatedPrompt = await promptService.setActivePrompt(id);
    
    if (!activatedPrompt) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    res.status(200).json(activatedPrompt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};