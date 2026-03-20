import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private mode: string;
  private transporter: any;

  constructor() {
    this.mode = process.env.EMAIL_MODE || 'MOCK';

    if (this.mode === 'REAL') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email: string, otp: string): Promise<boolean> {
    const subject = 'Email Verification - OTP Code';
    const html = `
      <p>Your verification code is:</p>
      <h2>${otp}</h2>
      <p>This code expires in 5 minutes.</p>
      <p>Do not share this code with anyone.</p>
    `;
  
    return this.send({ to: email, subject, html });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    const subject = 'Password Reset Request';
    const html = `
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    `;
  
    return this.send({ to: email, subject, html });
  }

  /**
   * Main send method
   */
  private async send(options: EmailOptions): Promise<boolean> {
    if (this.mode === 'MOCK') {
      return this.mockSend(options);
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        ...options
      });
      console.log(`✅ Email sent to ${options.to}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Mock send - print to console
   */
  private mockSend(options: EmailOptions): boolean {
    console.log('\n' + '='.repeat(70));
    console.log('📧 EMAIL SERVICE (DEVELOPMENT MODE - MOCK)');
    console.log('='.repeat(70));
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('-'.repeat(70));
    console.log(options.html);
    console.log('='.repeat(70) + '\n');
    return true;
  }
}

export default new EmailService();