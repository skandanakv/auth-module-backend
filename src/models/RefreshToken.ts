import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry time is required'],
      index: { expireAfterSeconds: 0 } // Auto-delete expired tokens
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
export default RefreshToken;
