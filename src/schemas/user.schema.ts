import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { userRole, userRoleEnum } from 'src/constants/enums';

@Schema()
export class User extends Document {
  @Prop({ required: true, minlength: 2, maxlength: 50, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 0, min: 0 })
  credits: number;

  @Prop({ type: String, enum: userRole, default: userRoleEnum.user })
  userRole: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
