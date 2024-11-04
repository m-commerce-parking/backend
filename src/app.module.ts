import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CarsModule } from './cars/cars.module';
import { ParkingSpacesModule } from './parking-spaces/parking-spaces.module';
import { ParkingActionModule } from './parking-action/parking-action.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/parking'),
    AuthModule,
    UserModule,
    CarsModule,
    ParkingSpacesModule,
    ParkingActionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
