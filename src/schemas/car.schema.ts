// car.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Car extends Document {
  @Prop({
    required: true,
    minlength: 7,
    maxlength: 8,
    match: /^[A-Z]{2,3}\s?[A-Z0-9]{4,5}$/,
  })
  registrationPlate: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;
}

export type CarDocument = Car & Document;
export const CarSchema = SchemaFactory.createForClass(Car);
