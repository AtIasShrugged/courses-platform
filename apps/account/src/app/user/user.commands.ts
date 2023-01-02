import {
	AccountBuyCourse,
	AccountChangeProfile,
	AccountCheckPayment,
} from '@courses-platform/contracts'
import { Body, Controller } from '@nestjs/common'
import { RMQValidate, RMQRoute, RMQService } from 'nestjs-rmq'
import { UserEntity } from './entities/user.entity'
import { UserRepository } from './repositories/user.repository'
import { BuyCourseSaga } from './sagas/buy-course/buy-course.saga'

@Controller()
export class UserCommands {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly rmqService: RMQService
	) {}

	@RMQValidate()
	@RMQRoute(AccountChangeProfile.topic)
	async userInfo(
		@Body() { id, payload }: AccountChangeProfile.Request
	): Promise<AccountChangeProfile.Response> {
		const user = await this.userRepository.findById(id)
		if (!user) {
			throw new Error('User is not exist')
		}

		const updatedUser = new UserEntity(user).updateProfile(payload.username)
		await this.userRepository.update(updatedUser)

		return { user: { username: updatedUser.username } }
	}

	@RMQValidate()
	@RMQRoute(AccountBuyCourse.topic)
	async buyCourse(
		@Body() { courseId, userId }: AccountBuyCourse.Request
	): Promise<AccountBuyCourse.Response> {
		const existedUser = await this.userRepository.findById(userId)
		if (!existedUser) {
			throw new Error('User does not exist')
		}

		const userEntity = new UserEntity(existedUser)
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService)

		const { user, paymentLink } = await saga.getState().pay()
		await this.userRepository.update(user)

		return { paymentLink }
	}

	@RMQValidate()
	@RMQRoute(AccountCheckPayment.topic)
	async checkPayment(
		@Body() { courseId, userId }: AccountCheckPayment.Request
	): Promise<AccountCheckPayment.Response> {
		const existedUser = await this.userRepository.findById(userId)
		if (!existedUser) {
			throw new Error('User does not exist')
		}

		const userEntity = new UserEntity(existedUser)
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService)

		const { user, status } = await saga.getState().checkPayment()
		await this.userRepository.update(user)

		return { status }
	}
}
