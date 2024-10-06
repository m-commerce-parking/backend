import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  parkingSpaceStatus,
  parkingSpaceStatusEnum,
} from 'src/constants/enums';

@Schema()
export class ParkingSpace extends Document {
  @Prop({ required: true })
  spaceNumber: number;

  @Prop({
    type: String,
    enum: parkingSpaceStatus,
    required: true,
    default: parkingSpaceStatusEnum.free,
  })
  status: string;
}

export type ParkingSpaceDocument = ParkingSpace & Document;
export const ParkingSpaceSchema = SchemaFactory.createForClass(ParkingSpace);
