import { PaymentStatus } from '@courses-platform/contracts'
import { PurchaseState } from '@courses-platform/interfaces'
import { UserEntity } from '../../../entities/user.entity'
import { BuyCourseSagaState } from '../buy-course.state'

export class BuyCourseSagaStateCanceled extends BuyCourseSagaState {
	public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
		this.saga.setState(PurchaseState.Started, this.saga.courseId)
		return this.saga.getState().pay()
	}

	public async checkPayment(): Promise<{
		user: UserEntity
		status: PaymentStatus
	}> {
		throw new Error('Payment was canceled')
	}

	public cancel(): Promise<{ user: UserEntity }> {
		throw new Error('Payment was canceled')
	}
}
