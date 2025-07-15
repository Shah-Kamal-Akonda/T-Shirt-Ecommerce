import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './auth/entity/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb')
  items: {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    discount?: number | null;
    size: string;
  }[];

  @Column('float')
  total: number;

  @Column('jsonb')
  address: {
    name: string;
    address: string;
    mobileNumber: string;
  };

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  createdAt: Date = new Date();
}