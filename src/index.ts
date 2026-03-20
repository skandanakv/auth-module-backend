import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: false
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, try again later'
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mount auth routes BEFORE notFoundHandler
app.use('/api/auth', authRoutes);

// Apply rate limiter AFTER routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/login-otp', loginLimiter);

// Not found handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

const startServer = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📍 Test: http://localhost:${PORT}/health`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();