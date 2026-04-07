import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export const registerUser = async (email: string, password: string) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    password: hashedPassword,
  });

  const token = generateToken(user.id);

  const userResponse = {
    _id: user._id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { user: userResponse, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id);

  const userResponse = {
    _id: user._id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { user: userResponse, token };
};