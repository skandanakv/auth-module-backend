import OTP from '../models/OTP';
import User from '../models/User';
import { generateOTP, getOTPExpiryTime, isExpired } from '../utils/helpers';
import { OTP_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import emailService from './emailService';

export class OTPService {
  /**
   * Generate OTP and send via email
   */
  async generateAndSendOTP(
    userId: string,
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Generate random 6-digit OTP
      const code = generateOTP();
      
      // Set expiry time (5 minutes from now)
      const expiresAt = getOTPExpiryTime(OTP_CONFIG.EXPIRY_MINUTES);

      // Delete old OTP for this user (if exists)
      await OTP.deleteOne({ userId });

      // Create new OTP in database
      await OTP.create({
        userId,
        code,
        type: 'email',
        expiresAt,
        attempts: 0,
        isUsed: false
      });

      // Send email with OTP
      await emailService.sendOTPEmail(email, code);

      return {
        success: true,
        message: SUCCESS_MESSAGES.OTP_SENT
      };
    } catch (error) {
      console.error('Error generating OTP:', error);
      return {
        success: false,
        message: 'Failed to generate OTP'
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(
    userId: string,
    code: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find OTP for this user
      const otp = await OTP.findOne({ userId, isUsed: false });

      if (!otp) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_OTP
        };
      }

      // Check if expired
      if (isExpired(otp.expiresAt)) {
        return {
          success: false,
          message: ERROR_MESSAGES.OTP_EXPIRED
        };
      }

      // Check attempts limit
      if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        return {
          success: false,
          message: ERROR_MESSAGES.OTP_ATTEMPTS_EXCEEDED
        };
      }

      // Check if code matches
      if (otp.code !== code) {
        otp.attempts += 1;
        await otp.save();
        
        const attemptsRemaining = OTP_CONFIG.MAX_ATTEMPTS - otp.attempts;
        return {
          success: false,
          message: `Invalid OTP. ${attemptsRemaining} attempts remaining`
        };
      }

      // Mark as used
      otp.isUsed = true;
      await otp.save();

      // Update user - email verified
      await User.findByIdAndUpdate(userId, { emailVerified: true });

      return {
        success: true,
        message: SUCCESS_MESSAGES.OTP_VERIFIED
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Error verifying OTP'
      };
    }
  }
}

export default new OTPService();