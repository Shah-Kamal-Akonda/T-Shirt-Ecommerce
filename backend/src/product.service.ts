import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async createProduct(
    name: string,
    price: number,
    description: string,
    images: string[],
    discount: number | null,
    categoryIds: number[],
  ): Promise<Product> {
    const product = new Product();
    product.name = name;
    product.price = price;
    product.description = description;
    product.images = images;
    product.discount = discount;

    if (categoryIds && categoryIds.length > 0) {
      product.categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
    } else {
      product.categories = [];
    }

    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['categories'] });
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.categories', 'category')
      .where('category.id = :categoryId', { categoryId })
      .getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['categories'] });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateProduct(
    id: number,
    name: string,
    price: number,
    description: string,
    images: string[],
    discount: number | null,
    categoryIds: number[],
  ): Promise<Product> {
    const product = await this.findOne(id);
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.images = images.length > 0 ? images : product.images;
    product.discount = discount !== null ? discount : product.discount;
    if (categoryIds && categoryIds.length > 0) {
      product.categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
    } else {
      product.categories = product.categories || [];
    }
    return this.productRepository.save(product);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.findOne(id);
    await this.productRepository.delete(id);
  }
}