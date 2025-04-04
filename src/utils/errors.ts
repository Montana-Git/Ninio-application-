/**
 * Custom error classes and error handling utilities
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public code: string;
  public status: number;
  public isOperational: boolean;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    status: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.isOperational = isOperational;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication error
 */
export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR', status: number = 401) {
    super(message, code, status, true);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  public fields?: Record<string, string>;
  
  constructor(
    message: string,
    fields?: Record<string, string>,
    code: string = 'VALIDATION_ERROR',
    status: number = 400
  ) {
    super(message, code, status, true);
    this.fields = fields;
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(message: string, code: string = 'NOT_FOUND', status: number = 404) {
    super(message, code, status, true);
  }
}

/**
 * API error
 */
export class ApiError extends AppError {
  public originalError?: any;
  
  constructor(
    message: string,
    originalError?: any,
    code: string = 'API_ERROR',
    status: number = 500
  ) {
    super(message, code, status, true);
    this.originalError = originalError;
  }
}

/**
 * Payment error
 */
export class PaymentError extends AppError {
  public transactionId?: string;
  
  constructor(
    message: string,
    transactionId?: string,
    code: string = 'PAYMENT_ERROR',
    status: number = 400
  ) {
    super(message, code, status, true);
    this.transactionId = transactionId;
  }
}

/**
 * Format error for client response
 * 
 * @param error - The error to format
 * @returns Formatted error object
 */
export function formatErrorResponse(error: any): {
  message: string;
  code: string;
  status: number;
  fields?: Record<string, string>;
  details?: string;
} {
  // If it's already an AppError, use its properties
  if (error instanceof AppError) {
    const response: any = {
      message: error.message,
      code: error.code,
      status: error.status,
    };
    
    // Add fields for ValidationError
    if (error instanceof ValidationError && error.fields) {
      response.fields = error.fields;
    }
    
    return response;
  }
  
  // Handle Supabase errors
  if (error?.code && typeof error.message === 'string') {
    return {
      message: error.message,
      code: `SUPABASE_${error.code}`,
      status: error.status || 500,
      details: error.details || undefined,
    };
  }
  
  // Default error format for unknown errors
  return {
    message: error?.message || 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    status: 500,
  };
}

/**
 * Log error details
 * 
 * @param error - The error to log
 * @param context - Additional context information
 */
export function logError(error: any, context?: Record<string, any>): void {
  // In production, this could send errors to a monitoring service
  console.error('Error:', {
    message: error.message,
    name: error.name,
    code: error.code,
    stack: error.stack,
    context,
  });
}

/**
 * Handle API error and return formatted response
 * 
 * @param error - The error to handle
 * @param context - Additional context information
 * @returns Formatted error response
 */
export function handleApiError(error: any, context?: Record<string, any>): {
  data: null;
  error: ReturnType<typeof formatErrorResponse>;
} {
  // Log the error
  logError(error, context);
  
  // Format the error for response
  const formattedError = formatErrorResponse(error);
  
  return {
    data: null,
    error: formattedError,
  };
}
