import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product.module';
import { CategoryModule } from './category.module';
import { AddressModule } from './address.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'Kamal2093@',
      database: process.env.DATABASE_NAME || 'T_Shirt_Ecommerce',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
    }),
    ProductModule,
    CategoryModule,
    AddressModule,
    AuthModule,
    OrderModule,
  ],
})
export class AppModule {}