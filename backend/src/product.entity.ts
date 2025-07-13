import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  price: number;

  @Column()
  description: string;

  @Column('jsonb')
  images: string[];

  @Column('float', { nullable: true })
  discount: number | null;

   // ADD HERE: Added sizes field to store available sizes (e.g., ["S", "M", "L"])
  @Column('varchar', { array: true, nullable: true })
  sizes: string[] | null;

  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];
}