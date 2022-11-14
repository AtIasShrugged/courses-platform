import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	@Post('login')
	async login(@Body() { email, password }: LoginDto) {
		const { id } = await this.authService.validateUser(email, password)
		return this.authService.login(id)
	}
}

export type RegisterDto = {
	email: string
	password: string
	username?: string
}

export type LoginDto = Omit<RegisterDto, 'username'>
