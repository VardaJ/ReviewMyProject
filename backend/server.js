import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import projectRoutes from './routes/projectRoutes.js';
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    next();
});

// Configure CORS with more detailed logging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Request origin:', origin);
  next();
});

app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000', 'http://localhost:8080', 'http://localhost:8081'];
        console.log('Incoming request from origin:', origin);
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Origin not allowed:', origin);
            return callback(null, false);
        }
        
        console.log('Origin allowed:', origin);
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files from the React app
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    console.log('✅ Serving static files from:', distPath);
    app.use(express.static(distPath));

    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        // Skip API routes
        if (!req.url.startsWith('/api/')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
} else {
    console.log('⚠️ Frontend build directory not found. Run npm run build first.');
}

// MongoDB Connection with detailed logging
const connectDB = async () => {
    try {
        console.log('=== MongoDB Connection Attempt ===');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mentor_meet_space';
        console.log('MongoDB URI:', mongoUri);
        
        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Increased timeout
            retryWrites: true,
            retryReads: true
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log('Connection state:', mongoose.connection.readyState);
        console.log('Database name:', mongoose.connection.name);
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        // Set up error handlers
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
        
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", {
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack
        });
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to MongoDB server. Please ensure:');
            console.error('1. MongoDB is installed and running');
            console.error('2. The connection string is correct');
            console.error('3. The port is not blocked by a firewall');
        }
        
        process.exit(1);
    }
};

// Connect to MongoDB
await connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

const startServer = async (initialPort) => {
    let port = initialPort;
    const maxAttempts = 10;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                const server = app.listen(port)
                    .once('listening', () => {
                        console.log(`✅ Server running on port ${port}`);
                        console.log(`✅ Upload directory: ${uploadsDir}`);
                        console.log(`✅ Server URL: http://localhost:${port}`);
                        resolve();
                    })
                    .once('error', (err) => {
                        if (err.code === 'EADDRINUSE') {
                            console.log(`Port ${port} is busy, trying ${port + 1}...`);
                            port++;
                            server.close();
                            reject(err);
                        } else {
                            reject(err);
                        }
                    });
            });
            // If we get here, the server started successfully
            break;
        } catch (err) {
            if (attempt === maxAttempts - 1) {
                console.error(`Failed to start server after ${maxAttempts} attempts`);
                process.exit(1);
            }
            // Continue to next attempt with incremented port
            continue;
        }
    }
};

const PORT = process.env.PORT || 8080;
startServer(PORT);
