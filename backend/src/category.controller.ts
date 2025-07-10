import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body('name') name: string) {
    return this.categoryService.createCategory(name);
  }

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  
 
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body('name') name: string) {
    return this.categoryService.updateCategory(id, name);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.categoryService.deleteCategory(id);
  }
}