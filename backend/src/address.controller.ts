import { Controller, Get, Post, Put, Delete, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AddressService } from './address.service';
import { Address } from './address.entity';
import * as jwt from 'jsonwebtoken';

// Define the expected JWT payload structure
interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async getAddresses(@Req() request: any) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new HttpException('Authorization token missing', HttpStatus.UNAUTHORIZED);
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY || 'mysecretkey') as JwtPayload;
      if (!decoded.userId) {
        throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
      }
      const addresses = await this.addressService.getAddresses(decoded.userId);
      return { addresses };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to verify token or fetch addresses',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Post()
  async addAddress(@Req() request: any, @Body() body: Partial<Address>) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new HttpException('Authorization token missing', HttpStatus.UNAUTHORIZED);
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY || 'mysecretkey') as JwtPayload;
      if (!decoded.userId) {
        throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
      }
      const address = await this.addressService.addAddress(decoded.userId, body);
      return { message: 'Address added successfully', address };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to add address',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  async updateAddress(@Req() request: any, @Body() body: Partial<Address>, @Body('id') id: number) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new HttpException('Authorization token missing', HttpStatus.UNAUTHORIZED);
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY || 'mysecretkey') as JwtPayload;
      if (!decoded.userId) {
        throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
      }
      const address = await this.addressService.updateAddress(id, decoded.userId, body);
      return { message: 'Address updated successfully', address };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update address',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  async deleteAddress(@Req() request: any, @Body('id') id: number) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new HttpException('Authorization token missing', HttpStatus.UNAUTHORIZED);
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY || 'mysecretkey') as JwtPayload;
      if (!decoded.userId) {
        throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
      }
      await this.addressService.deleteAddress(id, decoded.userId);
      return { message: 'Address deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete address',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}