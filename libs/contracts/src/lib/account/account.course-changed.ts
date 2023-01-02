import { PurchaseState } from '@courses-platform/interfaces'
import { IsString } from 'class-validator'

export namespace AccountCourseChanged {
	export const topic = 'account.course-changed.event'

	export class Request {
		@IsString()
		userId: string

		@IsString()
		courseId: string

		@IsString()
		state: PurchaseState
	}
}
