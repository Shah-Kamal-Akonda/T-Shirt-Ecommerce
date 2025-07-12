import { Controller, Post, Put, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

// Define the expected JWT payload structure
interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: { email: string; password: string }) {
    try {
      await this.authService.signup(body.email, body.password);
      return { message: 'Verification code sent to your email' };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to send verification code', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('verify-code')
  async verifyCode(@Body() body: { email: string; code: string; password: string }) {
    try {
      const { user, token } = await this.authService.verifyCode(body.email, body.code, body.password);
      return { message: 'Sign up successful', userId: user.id, token };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to verify code', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const { user, token } = await this.authService.login(body.email, body.password);
      return { message: 'Login successful', userId: user.id, token };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to login', error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    try {
      await this.authService.forgotPassword(body.email);
      return { message: 'Reset code sent to your email' };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to send reset code', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    try {
      await this.authService.resetPassword(body.email, body.code, body.newPassword);
      return { message: 'Password reset successful' };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to reset password', HttpStatus.BAD_REQUEST);
    }
  }

  @Put('update-password')
  async updatePassword(@Req() request: Request, @Body() body: { newPassword: string }) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new HttpException('Authorization token missing', HttpStatus.UNAUTHORIZED);
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY || 'mysecretkey') as JwtPayload;
      if (!decoded.userId) {
        throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
      }
      await this.authService.updatePassword(decoded.userId, body.newPassword);
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update password',
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}