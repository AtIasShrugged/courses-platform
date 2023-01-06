import { AccountCourseChanged } from '@courses-platform/contracts'
import {
	IDomainEvent,
	IUser,
	IUserCourse,
	PurchaseState,
	UserRole,
} from '@courses-platform/interfaces'
import { compare, genSalt, hash } from 'bcryptjs'

export class UserEntity implements IUser {
	_id?: string
	username?: string
	email: string
	passwordHash: string
	role: UserRole
	courses?: IUserCourse[]
	events: IDomainEvent[] = []

	constructor(user: IUser) {
		this._id = user._id
		this.username = user.username
		this.passwordHash = user.passwordHash
		this.email = user.email
		this.role = user.role
		this.courses = user.courses
	}

	public getCourseState(courseId: string) {
		return (
			this.courses.find((c) => c.courseId === courseId)?.purchaseState ??
			PurchaseState.Started
		)
	}

	public addCourse(courseId: string) {
		const existedCourse = this.courses.find((c) => c.courseId === courseId)
		if (existedCourse) {
			throw new Error('You already own this course')
		}

		this.courses.push({ courseId, purchaseState: PurchaseState.Started })
	}

	public deleteCourse(courseId: string) {
		this.courses = this.courses.filter((c) => c.courseId !== courseId)
	}

	public setCourseState(courseId: string, state: PurchaseState) {
		if (state === PurchaseState.Started) {
			this.addCourse(courseId)
			this.events.push({
				topic: AccountCourseChanged.topic,
				data: { courseId, userId: this._id, state },
			})
			return this
		}

		if (state === PurchaseState.Canceled) {
			this.deleteCourse(courseId)
			this.events.push({
				topic: AccountCourseChanged.topic,
				data: { courseId, userId: this._id, state },
			})
			return this
		}

		this.courses = this.courses.map((c) => {
			if (c.courseId === courseId) {
				c.purchaseState = state
				return c
			}
			return c
		})

		this.events.push({
			topic: AccountCourseChanged.topic,
			data: { courseId, userId: this._id, state },
		})
		return this
	}

	public getPublicProfile() {
		return {
			username: this.username,
			email: this.email,
			role: this.role,
		}
	}

	public updateProfile(username: string) {
		this.username = username
		return this
	}

	public async setPassword(password: string) {
		const salt = await genSalt(10)
		this.passwordHash = await hash(password, salt)
		return this
	}

	public validatePassword(password: string) {
		return compare(password, this.passwordHash)
	}
}
