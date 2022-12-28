import { IUser, IUserCourse, UserRole } from '@courses-platform/interfaces'
import { compare, genSalt, hash } from 'bcryptjs'

export class UserEntity implements IUser {
	_id?: string
	username?: string
	email: string
	passwordHash: string
	role: UserRole
	courses?: IUserCourse[]

	constructor(user: IUser) {
		this._id = user._id
		this.username = user.username
		this.passwordHash = user.passwordHash
		this.email = user.email
		this.role = user.role
		this.courses = user.courses
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
