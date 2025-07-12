import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from './entity/user.entity';

// Define the expected JWT payload structure
interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private verificationCodes: Map<string, string> = new Map();
  private resetCodes: Map<string, string> = new Map();
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.SECRET_KEY) {
      throw new Error('EMAIL_USER, EMAIL_PASSWORD, or SECRET_KEY not set in .env');
    }
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async signup(email: string, password: string) {
    if (!email || !password) {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCodes.set(email, code);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verification Code for T-Shirt Ecommerce Sign Up',
      text: `Your verification code is: ${code}`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      setTimeout(() => this.verificationCodes.delete(email), 5 * 60 * 1000);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new HttpException(`Failed to send verification email: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyCode(email: string, code: string, password: string): Promise<{ user: User; token: string }> {
    const storedCode = this.verificationCodes.get(email);
    if (!storedCode || storedCode !== code) {
      throw new HttpException('Invalid or expired verification code', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashedPassword });
    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new HttpException(`Failed to save user: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const secretKey = process.env.SECRET_KEY || 'mysecretkey';
    const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
    this.verificationCodes.delete(email);
    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (!email || !password) {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    const secretKey = process.env.SECRET_KEY || 'mysecretkey';
    const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
    return { user, token };
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Email not registered', HttpStatus.BAD_REQUEST);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.resetCodes.set(email, code);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code for T-Shirt Ecommerce',
      text: `Your password reset code is: ${code}`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Reset email sent:', info.response);
      setTimeout(() => this.resetCodes.delete(email), 5 * 60 * 1000);
    } catch (error) {
      console.error('Error sending reset email:', error);
      throw new HttpException(`Failed to send reset email: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    if (!email || !code || !newPassword) {
      throw new HttpException('Email, code, and new password are required', HttpStatus.BAD_REQUEST);
    }

    const storedCode = this.resetCodes.get(email);
    if (!storedCode) {
      throw new HttpException('No reset code found for this email or code has expired', HttpStatus.BAD_REQUEST);
    }
    if (storedCode !== code) {
      throw new HttpException('Invalid reset code', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Email not registered', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    try {
      await this.userRepository.save(user);
      this.resetCodes.delete(email);
      return { message: 'Password reset successful' };
    } catch (error) {
      throw new HttpException(`Failed to update password: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePassword(userId: number, newPassword: string) {
    if (!newPassword) {
      throw new HttpException('New password is required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    try {
      await this.userRepository.save(user);
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new HttpException(`Failed to update password: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}