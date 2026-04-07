import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  token: string;
}

class AuthService {
  private readonly saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return secret;
  }

  private getJwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  private generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.getJwtSecret(), {
      expiresIn: this.getJwtExpiresIn(),
    });
  }

  private sanitizeUser(user: any) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async register(input: RegisterUserInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(input.password, this.saltRounds);

    const user = await User.create({
      name: input.name.trim(),
      email,
      password: hashedPassword,
    });

    const token = this.generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(input: LoginUserInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async verifyToken(token: string): Promise<AuthTokenPayload> {
    const decoded = jwt.verify(token, this.getJwtSecret()) as AuthTokenPayload;
    return decoded;
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(user);
  }
}

export default new AuthService();