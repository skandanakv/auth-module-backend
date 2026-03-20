/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get OTP expiry time (current time + 5 minutes)
 */
export const getOTPExpiryTime = (minutesFromNow: number = 5): Date => {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + minutesFromNow);
  return expiryTime;
};

/**
 * Get token expiry time (current time + seconds)
 */
export const getTokenExpiryTime = (secondsFromNow: number): Date => {
  const expiryTime = new Date();
  expiryTime.setSeconds(expiryTime.getSeconds() + secondsFromNow);
  return expiryTime;
};

/**
 * Check if a date is in the past
 */
export const isExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

/**
 * Format error response
 */
export const formatErrorResponse = (message: string, statusCode: number = 400) => {
  return {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString()
  };
};

/**
 * Format success response
 */
export const formatSuccessResponse = (message: string, data: any = null) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Check if account is locked
 */
export const isAccountLocked = (lockedUntil: Date | null): boolean => {
  if (!lockedUntil) return false;
  return new Date() < lockedUntil;
};

/**
 * Get time remaining for account unlock (in minutes)
 */
export const getUnlockTimeRemaining = (lockedUntil: Date | null): number => {
  if (!lockedUntil) return 0;
  const now = new Date();
  const remaining = lockedUntil.getTime() - now.getTime();
  return Math.ceil(remaining / (1000 * 60)); // Convert to minutes
};
