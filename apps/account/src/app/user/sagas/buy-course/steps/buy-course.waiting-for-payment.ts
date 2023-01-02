import { PaymentCheck, PaymentStatus } from '@courses-platform/contracts'
import { PurchaseState } from '@courses-platform/interfaces'
import { UserEntity } from '../../../entities/user.entity'
import { BuyCourseSagaState } from '../buy-course.state'

export class BuyCourseSagaStateWaitingForPayment extends BuyCourseSagaState {
	public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
		throw new Error('Payment already in progress')
	}

	public async checkPayment(): Promise<{
		user: UserEntity
		status: PaymentStatus
	}> {
		const { status } = await this.saga.rmqService.send<
			PaymentCheck.Request,
			PaymentCheck.Response
		>(PaymentCheck.topic, {
			courseId: this.saga.courseId,
			userId: this.saga.user._id,
		})

		if (status === PaymentStatus.Success)
			this.saga.setState(PurchaseState.Purchased, this.saga.courseId)
		if (status === PaymentStatus.Canceled)
			this.saga.setState(PurchaseState.Canceled, this.saga.courseId)

		return { user: this.saga.user, status }
	}

	public cancel(): Promise<{ user: UserEntity }> {
		throw new Error('Payment already in progress')
	}
}
