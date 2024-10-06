import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { parkingActionStatus } from 'src/constants/enums';

@Schema()
export class ParkingAction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ParkingSpace', required: true })
  parkingSpaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carId: Types.ObjectId;

  @Prop({ type: String, enum: parkingActionStatus, required: true })
  status: string;

  @Prop({ type: Date, required: true })
  parkTime: Date;

  @Prop({ type: Date, default: null })
  leaveTime: Date | null;
}

export type ParkingActionDocument = ParkingAction & Document;
export const ParkingActionSchema = SchemaFactory.createForClass(ParkingAction);
