import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
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
    sizes: string[] | null, // ADD HERE: Added sizes parameter
    categoryIds: number[],
  ): Promise<Product> {
    try {
      const product = new Product();
      product.name = name;
      product.price = price;
      product.description = description;
      product.images = images;
      product.discount = discount;
      // ADD HERE: Assign sizes to product
      product.sizes = sizes;

      if (categoryIds && categoryIds.length > 0) {
        product.categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
      } else {
        product.categories = [];
      }

      return await this.productRepository.save(product);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create product: ${error.message}`);
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      return await this.productRepository.find({ relations: ['categories'] });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch all products: ${error.message}`);
    }
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    try {
      return await this.productRepository
        .createQueryBuilder('product')
        .leftJoin('product.categories', 'category')
        .where('category.id = :categoryId', { categoryId })
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch products by category: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({ where: { id }, relations: ['categories'] });
      if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
      return product;
    } catch (error) {
      throw error instanceof NotFoundException ? error : new InternalServerErrorException(`Failed to fetch product: ${error.message}`);
    }
  }

  async searchProducts(name: string, size?: string): Promise<Product[]> { // ADD HERE: Added size parameter
    try {
      if (!name && !size) {
        return [];
      }
      const where: any = {};
      if (name) {
        const sanitizedName = name.replace(/[%_\\]/g, '\\$&');
        where.name = Like(`%${sanitizedName}%`);
      }
      // ADD HERE: Filter by size using ANY for PostgreSQL array
      if (size) {
        where.sizes = Like(`%${size}%`);
      }
      return await this.productRepository.find({
        where,
        relations: ['categories'],
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to search products: ${error.message}`);
    }
  }

  async updateProduct(
    id: number,
    name: string,
    price: number,
    description: string,
    images: string[],
    discount: number | null,
    sizes: string[] | null, // ADD HERE: Added sizes parameter
    categoryIds: number[],
  ): Promise<Product> {
    try {
      const product = await this.findOne(id);
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.images = images.length > 0 ? images : product.images;
      product.discount = discount !== null ? discount : product.discount;
      // ADD HERE: Update sizes
      product.sizes = sizes !== null ? sizes : product.sizes;
      if (categoryIds && categoryIds.length > 0) {
        product.categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
      }
      return await this.productRepository.save(product);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update product: ${error.message}`);
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await this.findOne(id);
      await this.productRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete product: ${error.message}`);
    }
  }
}