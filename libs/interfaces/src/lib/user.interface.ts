export enum UserRole {
	Teacher = 'Teacher',
	Student = 'Student',
}

export interface IUser {
	_id?: string
	username?: string
	email: string
	passwordHash: string
	role: UserRole
}
