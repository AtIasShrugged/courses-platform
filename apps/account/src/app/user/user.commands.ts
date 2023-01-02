import {
	AccountBuyCourse,
	AccountChangeProfile,
	AccountCheckPayment,
} from '@courses-platform/contracts'
import { Body, Controller } from '@nestjs/common'
import { RMQValidate, RMQRoute } from 'nestjs-rmq'
import { UserService } from './user.service'

@Controller()
export class UserCommands {
	constructor(private readonly userService: UserService) {}

	@RMQValidate()
	@RMQRoute(AccountChangeProfile.topic)
	async changeProfile(
		@Body() { id, payload }: AccountChangeProfile.Request
	): Promise<AccountChangeProfile.Response> {
		return this.userService.changeProfile(payload, id)
	}

	@RMQValidate()
	@RMQRoute(AccountBuyCourse.topic)
	async buyCourse(
		@Body() { courseId, userId }: AccountBuyCourse.Request
	): Promise<AccountBuyCourse.Response> {
		return this.userService.buyCourse(userId, courseId)
	}

	@RMQValidate()
	@RMQRoute(AccountCheckPayment.topic)
	async checkPayment(
		@Body() { courseId, userId }: AccountCheckPayment.Request
	): Promise<AccountCheckPayment.Response> {
		return this.userService.checkPayment(userId, courseId)
	}
}
