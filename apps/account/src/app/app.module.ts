import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { getMongoConfig } from './configs/mongo.config'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: './envs/.account.env',
		}),
		MongooseModule.forRootAsync(getMongoConfig()),
		UserModule,
		AuthModule,
	],
})
export class AppModule {}
