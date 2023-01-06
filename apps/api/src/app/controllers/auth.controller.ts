import { AccountLogin, AccountRegister } from '@courses-platform/contracts'
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common'
import { RMQService } from 'nestjs-rmq'
import { LoginDTO } from '../dtos/login.dto'
import { RegisterDTO } from '../dtos/register.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly rmqService: RMQService) {}

	@Post('register')
	async register(@Body() dto: RegisterDTO) {
		try {
			return await this.rmqService.send<
				AccountRegister.Request,
				AccountRegister.Response
			>(AccountRegister.topic, dto, {
				headers: {
					requestId: 'test',
				},
			})
		} catch (e) {
			if (e instanceof Error) {
				throw new UnauthorizedException(e.message)
			}
		}
	}

	@Post('login')
	async login(@Body() dto: LoginDTO) {
		try {
			return await this.rmqService.send<
				AccountLogin.Request,
				AccountLogin.Response
			>(AccountLogin.topic, dto)
		} catch (e) {
			if (e instanceof Error) {
				throw new UnauthorizedException(e.message)
			}
		}
	}
}
