import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column('text')
  description: string;

  @Column('simple-array')
  images: string[];

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable()
  categories: Category[];
}