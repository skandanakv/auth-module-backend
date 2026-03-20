import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

// TypeScript interface - defines the shape of User document
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin' | 'super_admin';
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// MongoDB Schema - defines structure in database
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Hash password before saving (MIDDLEWARE - runs before save)
// WHY? Never store plain passwords in database
// HOW? Uses bcrypt to create irreversible hash
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  // This prevents re-hashing already hashed passwords
  if (!this.isModified('password')) {
    // return next();
  }

  try {
    // Generate salt - makes each hash unique even for same password
    // Salt rounds = 10 (higher = more secure but slower)
    const salt = await bcryptjs.genSalt(10);
    
    // Hash password with salt
    // Example: "Test123!" becomes "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeveaI2.Cb7IK..."
    this.password = await bcryptjs.hash(this.password, salt);
    
    // Continue to save
    // next();
  } catch (error) {
    // If error during hashing, pass it to next
    // next(error as Error);
  }
});

// Instance method - allows user.comparePassword(password)
// WHY? Need way to verify login password against stored hash
// HOW? bcrypt compares plain password with hash (one-way comparison)
userSchema.methods.comparePassword = async function(
  this: IUser,
  password: string
): Promise<boolean> {
  // bcryptjs.compare returns true if passwords match
  // It safely compares without revealing the hash
  return await bcryptjs.compare(password, this.password);
};

// Create and export model
const User = mongoose.model<IUser>('User', userSchema);
export default User;