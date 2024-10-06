import { Logger, Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CarSchema } from 'src/schemas/car.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: 'Car', schema: CarSchema }]),
  ],
  providers: [CarsService, Logger],
  controllers: [CarsController],
})
export class CarsModule {}
