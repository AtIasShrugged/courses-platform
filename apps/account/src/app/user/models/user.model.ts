import { IUser, UserRole } from '@courses-platform/interfaces'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class User extends Document implements IUser {
	@Prop()
	username?: string

	@Prop({ required: true })
	email: string

	@Prop({ required: true })
	passwordHash: string

	@Prop({
		required: true,
		enum: UserRole,
		type: String,
		default: UserRole.Student,
	})
	role: UserRole
}

export const UserSchema = SchemaFactory.createForClass(User)
