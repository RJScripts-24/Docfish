import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import authService from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: Express.UserPayload;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = await authService.verifyToken(token);
      
      const user = await User.findById(decoded.userId).select('_id email');

      if (!user) {
        res.status(401).json({ error: 'Not authorized, user not found' });
        return;
      }

      req.user = {
        userId: user._id.toString(),
        email: user.email,
      };
      
      return next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
      return;
    }
  }

  res.status(401).json({ error: 'Not authorized, no token' });
};