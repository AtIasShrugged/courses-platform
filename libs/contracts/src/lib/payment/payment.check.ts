import { IsString } from 'class-validator'

export enum PaymentStatus {
	Progress = 'progress',
	Success = 'success',
	Canceled = 'canceled',
}

export namespace PaymentCheck {
	export const topic = 'payment.check.query'

	export class Request {
		@IsString()
		courseId: string

		@IsString()
		userId: string
	}

	export class Response {
		status: PaymentStatus
	}
}
