import { IUser } from '@courses-platform/interfaces'
import { IsString } from 'class-validator'

export namespace AccountUserInfo {
	export const topic = 'account.user-info.query'

	export class Request {
		@IsString()
		id: string
	}

	export class Response {
		profile: Omit<IUser, '_id' | 'passwordHash' | 'courses'>
	}
}
