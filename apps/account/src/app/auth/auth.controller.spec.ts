import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq'
import { AuthModule } from './auth.module'
import { UserModule } from '../user/user.module'
import { MongooseModule } from '@nestjs/mongoose'
import { getMongoConfig } from '../configs/mongo.config'
import { INestApplication } from '@nestjs/common'
import { UserRepository } from '../user/repositories/user.repository'
import { AccountLogin, AccountRegister } from '@courses-platform/contracts'

const authLogin: AccountLogin.Request = {
	email: 'qw@qw.qw',
	password: 'qw',
}

const authRegister: AccountRegister.Request = {
	...authLogin,
	username: 'John',
}

describe('AuthController', () => {
	let app: INestApplication
	let userRepository: UserRepository
	let rmqService: RMQTestService

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					envFilePath: './envs/.account.env',
				}),
				RMQModule.forTest({}),
				MongooseModule.forRootAsync(getMongoConfig()),
				UserModule,
				AuthModule,
			],
		}).compile()

		app = module.createNestApplication()
		userRepository = app.get<UserRepository>(UserRepository)
		rmqService = app.get(RMQService)
		await app.init()
	})

	it('Register', async () => {
		const res = await rmqService.triggerRoute<
			AccountRegister.Request,
			AccountRegister.Response
		>(AccountRegister.topic, authRegister)

		expect(res.email).toEqual(authRegister.email)
	})

	it('Login', async () => {
		const res = await rmqService.triggerRoute<
			AccountLogin.Request,
			AccountLogin.Response
		>(AccountLogin.topic, authLogin)

		expect(res.accessToken).toBeDefined()
	})

	afterAll(async () => {
		await userRepository.delete(authRegister.email)
	})
})
