import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      
      req.user = await User.findById(decoded.id).select('-password');
      
      return next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
      return;
    }
  }

  res.status(401).json({ error: 'Not authorized, no token' });
};