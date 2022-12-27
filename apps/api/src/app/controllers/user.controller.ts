import { Controller, Post, UseGuards } from '@nestjs/common'
import { JWTAuthGuard } from '../guards/jwt.guard'
import { UserID } from '../guards/user.decorator'

@Controller('user')
export class UserController {
	@UseGuards(JWTAuthGuard)
	@Post('info')
	async info(@UserID() userId: string) {
		console.log(userId)
	}
}
