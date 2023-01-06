import {
	AccountUserCourses,
	AccountUserInfo,
} from '@courses-platform/contracts'
import { Body, Controller, Get } from '@nestjs/common'
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq'
import { UserEntity } from './entities/user.entity'
import { UserRepository } from './repositories/user.repository'

@Controller()
export class UserQueries {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly rmqService: RMQService
	) {}

	@RMQValidate()
	@RMQRoute(AccountUserInfo.topic)
	async userInfo(
		@Body() { id }: AccountUserInfo.Request
	): Promise<AccountUserInfo.Response> {
		const user = await this.userRepository.findById(id)
		const profile = new UserEntity(user).getPublicProfile()
		return { profile }
	}

	@RMQValidate()
	@RMQRoute(AccountUserCourses.topic)
	async userCourses(
		@Body() { id }: AccountUserCourses.Request
	): Promise<AccountUserCourses.Response> {
		const user = await this.userRepository.findById(id)
		return {
			courses: user.courses,
		}
	}

	@Get('health-check')
	async healthCheck() {
		const isRMQ = this.rmqService.healthCheck()
		// TODO: if no - call restart connection or throw error
		const user = await this.userRepository.healthCheck()
		// TODO: if no - call restart connection or throw error
	}
}
