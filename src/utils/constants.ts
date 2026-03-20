// JWT Token expiry times
export const JWT_EXPIRY = {
  ACCESS_TOKEN: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN: 7 * 24 * 60 * 60 // 7 days in seconds
};

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 30
};

// Account Lockout Configuration
export const ACCOUNT_LOCKOUT = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCK_TIME_MINUTES: 15
};

// Regex Patterns
export const PATTERNS = {
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PHONE: 'Please provide a valid phone number',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  USER_NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already registered',
  PHONE_EXISTS: 'Phone number already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is locked. Please try again later',
  EMAIL_NOT_VERIFIED: 'Please verify your email first',
  PHONE_NOT_VERIFIED: 'Please verify your phone first',
  INVALID_OTP: 'Invalid OTP code',
  OTP_EXPIRED: 'OTP has expired',
  OTP_ATTEMPTS_EXCEEDED: 'Maximum OTP attempts exceeded',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Token is required'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTERED: 'User registered successfully',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'Email verified successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_RESET: 'Password reset successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully'
};
