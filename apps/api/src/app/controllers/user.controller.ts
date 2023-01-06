import { Controller, Logger, Post, UseGuards } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { JWTAuthGuard } from '../guards/jwt.guard'
import { UserID } from '../guards/user.decorator'

@Controller('user')
export class UserController {
	@UseGuards(JWTAuthGuard)
	@Post('info')
	async info(@UserID() userId: string) {
		console.log(userId)
	}

	@Cron('*/5 * * * * *')
	async cron() {
		Logger.log('Done')
	}
}
