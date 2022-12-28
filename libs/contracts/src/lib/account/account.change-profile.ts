import { IUser } from '@courses-platform/interfaces'
import { IsString } from 'class-validator'

export namespace AccountChangeProfile {
	export const topic = 'account.change-profile.command'

	export class Request {
		@IsString()
		id: string

		@IsString()
		payload: Pick<IUser, 'username'>
	}

	export class Response {
		user: Pick<IUser, 'username'>
	}
}
