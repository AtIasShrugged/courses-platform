import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { getMongoConfig } from './configs/mongo.config'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { RMQModule } from 'nestjs-rmq'
import { getRMQConfig } from './configs/rmq.config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: './envs/.account.env',
		}),
		RMQModule.forRootAsync(getRMQConfig()),
		MongooseModule.forRootAsync(getMongoConfig()),
		UserModule,
		AuthModule,
	],
})
export class AppModule {}
