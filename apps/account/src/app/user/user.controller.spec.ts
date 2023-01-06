import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq'
import { UserModule } from './user.module'
import { AuthModule } from '../auth/auth.module'
import { MongooseModule } from '@nestjs/mongoose'
import { getMongoConfig } from '../configs/mongo.config'
import { INestApplication } from '@nestjs/common'
import { UserRepository } from './repositories/user.repository'
import {
	AccountBuyCourse,
	AccountCheckPayment,
	AccountLogin,
	AccountRegister,
	AccountUserInfo,
	CourseGetCourse,
	PaymentCheck,
	PaymentGenerateLink,
	PaymentStatus,
} from '@courses-platform/contracts'
import { verify } from 'jsonwebtoken'

const authLogin: AccountLogin.Request = {
	email: 'qw@qw.qw',
	password: 'qw',
}

const authRegister: AccountRegister.Request = {
	...authLogin,
	username: 'John',
}

const courseId = 'course-id'
const paymentStatus = PaymentStatus.Success

describe('UserController', () => {
	let app: INestApplication
	let userRepository: UserRepository
	let rmqService: RMQTestService
	let configService: ConfigService
	let userId: string
	let token: string

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
		configService = app.get<ConfigService>(ConfigService)

		await app.init()

		await rmqService.triggerRoute<
			AccountRegister.Request,
			AccountRegister.Response
		>(AccountRegister.topic, authRegister)

		const { accessToken } = await rmqService.triggerRoute<
			AccountLogin.Request,
			AccountLogin.Response
		>(AccountLogin.topic, authLogin)

		token = accessToken
		const data = verify(token, configService.get('JWT_SECRET'))
		userId = data['id']
	})

	it('AccountUserInfo', async () => {
		const res = await rmqService.triggerRoute<
			AccountUserInfo.Request,
			AccountUserInfo.Response
		>(AccountUserInfo.topic, { id: userId })

		expect(res.profile.username).toEqual(authRegister.username)
	})

	it('BuyCourse', async () => {
		const paymentLink = 'payment-link'

		rmqService.mockReply<CourseGetCourse.Response>(CourseGetCourse.topic, {
			course: {
				_id: courseId,
				price: 777,
			},
		})

		rmqService.mockReply<PaymentGenerateLink.Response>(
			PaymentGenerateLink.topic,
			{
				paymentLink,
			}
		)

		const res = await rmqService.triggerRoute<
			AccountBuyCourse.Request,
			AccountBuyCourse.Response
		>(AccountBuyCourse.topic, { courseId, userId })

		expect(res.paymentLink).toEqual(paymentLink)

		await expect(
			rmqService.triggerRoute<
				AccountBuyCourse.Request,
				AccountBuyCourse.Response
			>(AccountBuyCourse.topic, { courseId, userId })
		).rejects.toThrowError()
	})

	it('CheckPayment', async () => {
		rmqService.mockReply<PaymentCheck.Response>(PaymentCheck.topic, {
			status: paymentStatus,
		})

		const res = await rmqService.triggerRoute<
			AccountCheckPayment.Request,
			AccountCheckPayment.Response
		>(AccountCheckPayment.topic, { courseId, userId })

		expect(res.status).toEqual(paymentStatus)
	})

	afterAll(async () => {
		await userRepository.delete(authRegister.email)
		app.close()
	})
})
