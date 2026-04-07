import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
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
    avatarUrl?: string | null;
    isGuest?: boolean;
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

  private getJwtExpiresIn(): SignOptions['expiresIn'] {
    return (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';
  }

  private generateToken(payload: AuthTokenPayload, expiresIn?: SignOptions['expiresIn']): string {
    return jwt.sign(payload, this.getJwtSecret(), {
      expiresIn: expiresIn || this.getJwtExpiresIn(),
    });
  }

  private sanitizeUser(user: any) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      isGuest: Boolean(user.isGuest),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private issueAuthResponse(user: any, expiresIn?: SignOptions['expiresIn']): AuthResponse {
    const token = this.generateToken(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      expiresIn
    );

    return {
      user: this.sanitizeUser(user),
      token,
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

    return this.issueAuthResponse(user);
  }

  async login(input: LoginUserInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.password) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return this.issueAuthResponse(user);
  }

  async createGuestSession(): Promise<AuthResponse> {
    const random = crypto.randomUUID();
    const email = `guest-${random}@docfish.local`;
    const password = await bcrypt.hash(crypto.randomUUID(), this.saltRounds);

    const user = await User.create({
      name: `Guest ${random.slice(0, 8)}`,
      email,
      password,
      isGuest: true,
    });

    return this.issueAuthResponse(user, '12h');
  }

  async createOrGetSocialUser(input: {
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: input.name.trim() || 'Google User',
        email,
        avatarUrl: input.avatarUrl || null,
        isGuest: false,
      });
    } else if (input.avatarUrl && user.avatarUrl !== input.avatarUrl) {
      user.avatarUrl = input.avatarUrl;
      await user.save();
    }

    return this.issueAuthResponse(user);
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