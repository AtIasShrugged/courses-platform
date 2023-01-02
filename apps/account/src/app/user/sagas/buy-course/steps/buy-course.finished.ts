import { PaymentStatus } from '@courses-platform/contracts'
import { UserEntity } from '../../../entities/user.entity'
import { BuyCourseSagaState } from '../buy-course.state'

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
	public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
		throw new Error('Payment already finished')
	}

	public async checkPayment(): Promise<{
		user: UserEntity
		status: PaymentStatus
	}> {
		throw new Error('Payment already finished')
	}

	public cancel(): Promise<{ user: UserEntity }> {
		throw new Error('Payment already finished')
	}
}
