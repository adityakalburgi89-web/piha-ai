export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with identifier '${id}' not found.` : `${resource} not found.`, 404);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 400);
    this.errors = errors;
  }
}

export class ProviderError extends AppError {
  public readonly provider: string;

  constructor(provider: string, message: string, statusCode: number = 502) {
    super(`[${provider}] ${message}`, statusCode);
    this.provider = provider;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access.') {
    super(message, 401);
  }
}
