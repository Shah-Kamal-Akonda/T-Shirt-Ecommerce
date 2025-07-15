import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { User } from './auth/entity/user.entity';
import * as nodemailer from 'nodemailer';


@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOrder(orderData: { items: any[]; total: number; address: any }, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const order = this.orderRepository.create({
      items: orderData.items,
      total: orderData.total,
      address: orderData.address,
      user,
    });

    await this.orderRepository.save(order);

    await this.sendOrderConfirmationEmail(user.email, order);
    await this.sendOrderConfirmationEmail('sk5471905@gmail.com', order); // Replace with actual owner email

    return order;
  }

  private async sendOrderConfirmationEmail(to: string, order: Order) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const itemsList = order.items
      .map(
        (item) =>
          `${item.name} (Size: ${item.size}) - $${item.discount ? (item.price * (1 - item.discount / 100)).toFixed(2) : item.price.toFixed(2)} x ${item.quantity}`,
      )
      .join('\n');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Order Confirmation - T-Shirt Ecommerce',
      text: `
        Order ID: ${order.id}
        Items:
        ${itemsList}
        Total: $${order.total}
        Shipping Address: ${order.address.name}, ${order.address.address}, ${order.address.mobileNumber}
        Thank you for your order!
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}