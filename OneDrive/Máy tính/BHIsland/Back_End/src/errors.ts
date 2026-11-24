export type FieldError = { field: string; code: string; message: string };

export class AppError extends Error {
	constructor(
		public readonly status: number,
		public readonly title: string,
		message: string,
		public readonly fieldErrors?: FieldError[],
		public readonly retryAfter?: number
	) {
		super(message);
		this.name = 'AppError';
	}
}

export function validationErrors(issues: Array<{ path: PropertyKey[]; code: string; message: string }>): AppError {
	return new AppError(
		422,
		'Dữ liệu không hợp lệ',
		'Vui lòng kiểm tra các trường đã nhập.',
		issues.map((issue) => ({
			field: issue.path.map(String).join('.'),
			code: issue.code,
			message: issue.message
		}))
	);
}

export function parseInput<T>(schema: { safeParse(value: unknown): { success: true; data: T } | { success: false; error: { issues: Array<{ path: PropertyKey[]; code: string; message: string }> } } }, value: unknown): T {
	const result = schema.safeParse(value);
	if (!result.success) throw validationErrors(result.error.issues);
	return result.data;
}
