import { AccountChangeProfile } from '@courses-platform/contracts'
import { Body, Controller } from '@nestjs/common'
import { RMQValidate, RMQRoute } from 'nestjs-rmq'
import { UserEntity } from './entities/user.entity'
import { UserRepository } from './repositories/user.repository'

@Controller()
export class UserCommands {
	constructor(private readonly userRepository: UserRepository) {}

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
}
