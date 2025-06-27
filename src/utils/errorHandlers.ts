// Error handling utilities

export const logError = (error: unknown, context?: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const fullMessage = context ? `[${context}] ${errorMessage}` : errorMessage;
  
  console.error(fullMessage, error);
  
  // In production, this would send to error tracking service
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service like Sentry
  }
};

export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
