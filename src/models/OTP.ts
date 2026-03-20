import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  userId: mongoose.Types.ObjectId;
  code: string;
  type: 'email' | 'phone';
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    code: {
      type: String,
      required: [true, 'OTP code is required'],
      minlength: 6,
      maxlength: 6,
      match: [/^\d{6}$/, 'OTP must be 6 digits']
    },
    type: {
      type: String,
      enum: ['email', 'phone'],
      required: [true, 'OTP type is required']
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry time is required'],
      index: { expireAfterSeconds: 0 } // Auto-delete expired OTPs
    },
    attempts: {
      type: Number,
      default: 0,
      max: [3, 'Maximum 3 attempts allowed']
    },
    isUsed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const OTP = mongoose.model<IOTP>('OTP', otpSchema);
export default OTP;
