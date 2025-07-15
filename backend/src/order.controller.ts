import { Controller, Post, Body, HttpException, HttpStatus, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  email: string;
}

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() orderData: { items: any[]; total: number; address: any }, @Req() request: Request) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new HttpException('Authorization token missing', HttpStatus.UNAUTHORIZED);
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY || 'mysecretkey') as JwtPayload;
      const order = await this.orderService.createOrder(orderData, decoded.userId);
      return { message: 'Order created successfully', order };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}