// Types for validation
export interface ValidationError {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

// Types for error response
export interface ErrorResponse {
  status: string;
  message: string;
  stack?: string;
  errors?: ValidationError[];
}
