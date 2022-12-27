import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserID = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		return ctx.switchToHttp().getRequest()?.user
	}
)
