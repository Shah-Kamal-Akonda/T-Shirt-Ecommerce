import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductService } from './product.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './Uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @Body('name') name: string,
    @Body('price') price: string,
    @Body('description') description: string,
    @Body('discount') discount: string,
    @Body('sizes') sizes: string, // ADD HERE: Accept sizes as JSON string
    @UploadedFiles() files: Express.Multer.File[],
    @Body('categoryIds') categoryIds: string,
  ) {
    const imagePaths = files.map((file) => `/Uploads/${file.filename}`);
    const parsedCategoryIds = JSON.parse(categoryIds);
    const parsedPrice = parseFloat(price);
    const parsedDiscount = discount ? parseFloat(discount) : null;
    // ADD HERE: Parse sizes JSON string
    const parsedSizes = sizes ? JSON.parse(sizes) : null;
    return this.productService.createProduct(name, parsedPrice, description, imagePaths, parsedDiscount, parsedSizes, parsedCategoryIds);
  }

  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  @Get('category/:id')
  async findByCategory(@Param('id') categoryId: number) {
    return this.productService.findByCategory(categoryId);
  }

  @Get('search')
  async search(@Query('name') name: string, @Query('size') size?: string) { // ADD HERE: Add size query param
    return this.productService.searchProducts(name, size);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @Put(':id') // CHANGE HERE: Replaced @Patch with @Put to fix Cannot find name 'Patch'.ts(2304)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './Uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: number,
    @Body('name') name: string,
    @Body('price') price: string,
    @Body('description') description: string,
    @Body('discount') discount: string,
    @Body('sizes') sizes: string, // ADD HERE: Accept sizes as JSON string
    @UploadedFiles() files: Express.Multer.File[],
    @Body('categoryIds') categoryIds: string,
  ) {
    const imagePaths = files.map((file) => `/Uploads/${file.filename}`);
    const parsedCategoryIds = JSON.parse(categoryIds);
    const parsedPrice = parseFloat(price);
    const parsedDiscount = discount ? parseFloat(discount) : null;
    // ADD HERE: Parse sizes JSON string
    const parsedSizes = sizes ? JSON.parse(sizes) : null;
    return this.productService.updateProduct(id, name, parsedPrice, description, imagePaths, parsedDiscount, parsedSizes, parsedCategoryIds);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.productService.deleteProduct(id);
  }
}