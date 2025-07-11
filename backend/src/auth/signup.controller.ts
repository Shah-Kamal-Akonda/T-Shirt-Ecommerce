import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { SignupService } from './signup.service';

@Controller('auth')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('signup')
  async signup(@Body() body: { email: string; password: string }) {
    try {
      await this.signupService.signup(body.email, body.password);
      return { message: 'Verification code sent to your email' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('verify-code')
  async verifyCode(@Body() body: { email: string; code: string; password: string }) {
    try {
      const user = await this.signupService.verifyCode(body.email, body.code, body.password);
      return { message: 'Sign up successful', userId: user.id };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.signupService.login(body.email, body.password);
      return { message: 'Login successful', userId: user.id };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    try {
      await this.signupService.forgotPassword(body.email);
      return { message: 'Reset code sent to your email' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    try {
      await this.signupService.resetPassword(body.email, body.code, body.newPassword);
      return { message: 'Password reset successful' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}