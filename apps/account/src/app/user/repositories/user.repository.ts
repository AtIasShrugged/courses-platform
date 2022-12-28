import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserEntity } from '../entities/user.entity'
import { User } from '../models/user.model'

@Injectable()
export class UserRepository {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>
	) {}

	create(user: UserEntity) {
		const newUser = new this.userModel(user)
		return newUser.save()
	}

	update({ _id, ...data }: UserEntity) {
		return this.userModel.updateOne({ _id }, { $set: { ...data } }).exec()
	}

	async findById(id: string) {
		return this.userModel.findById(id).exec()
	}

	async findByEmail(email: string) {
		return this.userModel.findOne({ email }).exec()
	}

	async delete(email: string) {
		return this.userModel.deleteOne({ email }).exec()
	}
}
