import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken';
import { getTokenExpiryTime } from '../utils/helpers';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

export class TokenService {
  /**
   * Generate access token (15 minutes)
   */
  generateAccessToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      {
        userId,
        email,
        role
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  /**
   * Generate refresh token (7 days)
   */
  generateRefreshToken(userId: string): string {
    return jwt.sign(
      {
        userId
      },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Save refresh token to database
   */
  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = getTokenExpiryTime(7 * 24 * 60 * 60);

    await RefreshToken.create({
      userId,
      token,
      expiresAt,
      isRevoked: false
    });
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): { 
    valid: boolean; 
    payload?: any; 
    error?: string 
  } {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return { valid: true, payload };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): { 
    valid: boolean; 
    payload?: any; 
    error?: string 
  } {
    try {
      const payload = jwt.verify(token, JWT_REFRESH_SECRET);
      return { valid: true, payload };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Revoke refresh token (logout)
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await RefreshToken.updateOne(
      { token },
      { isRevoked: true }
    );
  }

  /**
   * Check if refresh token is valid and not revoked
   */
  async isRefreshTokenValid(token: string): Promise<boolean> {
    const refreshToken = await RefreshToken.findOne({ token });

    if (!refreshToken) return false;
    if (refreshToken.isRevoked) return false;

    return true;
  }
}

export default new TokenService();