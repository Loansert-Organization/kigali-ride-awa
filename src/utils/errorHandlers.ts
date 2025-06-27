
export const devLog = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV LOG] ${message}`, ...args);
  }
};

export const logError = (message: string, error?: any) => {
  console.error(`[ERROR] ${message}`, error);
};

export const handleApiError = (error: any, fallbackMessage = 'An error occurred') => {
  const message = error?.message || error?.error_description || fallbackMessage;
  console.error(message, error);
  return message;
};
