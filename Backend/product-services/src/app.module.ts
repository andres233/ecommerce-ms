import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { envs } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: envs.db_connection,
      host: envs.db_host,
      port: envs.db_port,
      database: envs.db_database,
      username: envs.db_username,
      password: envs.db_password,
      entities: ['dist/**/*.entity.{ts,js}'],
      synchronize: true, // never true in production!
    }),
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
