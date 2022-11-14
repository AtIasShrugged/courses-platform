import { UserRole } from '@courses-platform/interfaces'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserEntity } from '../user/entities/user.entity'
import { UserRepository } from '../user/repositories/user.repository'
import { RegisterDto } from './auth.controller'

@Injectable()
export class AuthService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtService
	) {}

	async register(dto: RegisterDto) {
		const { email, password, username } = dto

		const user = await this.userRepository.findUser(email)
		if (user) {
			throw new Error('User already exists')
		}

		const newUserEntity = await new UserEntity({
			username,
			email,
			role: UserRole.Student,
		}).setPassword(password)

		const newUser = await this.userRepository.createUser(newUserEntity)
		return { email: newUser.email }
	}

	async login(id: string) {
		return {
			access_token: await this.jwtService.signAsync({ id }),
		}
	}

	async validateUser(email: string, password: string) {
		const user = await this.userRepository.findUser(email)
		if (!user) {
			throw new Error('Wrong data')
		}

		const userEntity = new UserEntity(user)

		const isValid = await userEntity.validatePassword(password)
		if (!isValid) {
			throw new Error('Wrong data')
		}

		return { id: user._id }
	}
}
