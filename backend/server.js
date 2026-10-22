
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://skillgapai-fsd-frontend.onrender.com',
   'https://skillgapanalyzer-wwfp.vercel.app'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header, such as health checks
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Security middleware
app.use(helmet());

// CORS middleware must run before routes
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

app.use('/api', limiter);

// Basic health-check route
app.get('/', (req, res) => {
  res.status(200).send('Skill Gap Analysis API is running...');
});

// Connect to MongoDB
connectDB();

// Authentication routes
app.use('/api/auth', require('./routes/authRoutes'));

// Skills routes
app.use('/api/skills', require('./routes/skillRoutes'));

// Job analysis routes
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));

// Job postings routes
app.use('/api/job-postings', require('./routes/jobPostingRoutes'));

// Applications routes
app.use('/api/applications', require('./routes/applicationRoutes'));

// Messaging routes
app.use('/api/messages', require('./routes/messageRoutes'));

// Handle unknown API routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// General error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS error: This origin is not allowed'
    });
  }

  res.status(err.status || 500).json({
    message: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
