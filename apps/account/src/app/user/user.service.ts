import { AccountChangeProfile } from '@courses-platform/contracts'
import { IUser } from '@courses-platform/interfaces'
import { Injectable } from '@nestjs/common'
import { RMQService } from 'nestjs-rmq'
import { UserEntity } from './entities/user.entity'
import { UserRepository } from './repositories/user.repository'
import { BuyCourseSaga } from './sagas/buy-course/buy-course.saga'
import { UserEventEmitter } from './user.event-emitter'

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly rmqService: RMQService,
		private readonly userEventEmitter: UserEventEmitter
	) {}

	public async changeProfile(
		user: Pick<IUser, 'username'>,
		id: string
	): Promise<AccountChangeProfile.Response> {
		const existedUser = await this.userRepository.findById(id)
		if (!existedUser) {
			throw new Error('User is not exist')
		}

		const userEntity = new UserEntity(existedUser).updateProfile(user.username)
		await this.updateUser(userEntity)

		return { user: { username: userEntity.username } }
	}

	public async buyCourse(userId: string, courseId: string) {
		const existedUser = await this.userRepository.findById(userId)
		if (!existedUser) {
			throw new Error('User does not exist')
		}

		const userEntity = new UserEntity(existedUser)
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService)

		const { user, paymentLink } = await saga.getState().pay()
		await this.updateUser(user)

		return { paymentLink }
	}

	public async checkPayment(userId: string, courseId: string) {
		const existedUser = await this.userRepository.findById(userId)
		if (!existedUser) {
			throw new Error('User does not exist')
		}

		const userEntity = new UserEntity(existedUser)
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService)

		const { user, status } = await saga.getState().checkPayment()
		await this.updateUser(user)

		return { status }
	}

	private updateUser(user: UserEntity) {
		return Promise.all([
			this.userEventEmitter.handle(user),
			this.userRepository.update(user),
		])
	}
}
