import { AccountLogin, AccountRegister } from '@courses-platform/contracts'
import { Controller, Logger } from '@nestjs/common'
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq'
import { AuthService } from './auth.service'

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@RMQValidate()
	@RMQRoute(AccountRegister.topic)
	async register(
		dto: AccountRegister.Request,
		@RMQMessage msg: Message
	): Promise<AccountRegister.Response> {
		const rid = msg.properties.headers['requestId']
		const logger = new Logger(rid) // just for test, remove later
		logger.log('Test rid')

		return this.authService.register(dto)
	}

	@RMQValidate()
	@RMQRoute(AccountLogin.topic)
	async login({
		email,
		password,
	}: AccountLogin.Request): Promise<AccountLogin.Response> {
		const { id } = await this.authService.validateUser(email, password)
		return this.authService.login(id)
	}
}
