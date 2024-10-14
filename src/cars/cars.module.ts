import { Logger, Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CarSchema } from 'src/schemas/car.schema';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: 'Car', schema: CarSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [CarsService, Logger],
  controllers: [CarsController],
})
export class CarsModule {}
