// DOTENV MUST BE FIRST - BEFORE ANYTHING ELSE
require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = 'morphnote_auth';

let client;
let usersCollection;

// LOG JWT SECRET AT STARTUP
console.log('🔑 JWT_SECRET being used:', JWT_SECRET);
console.log('🔑 JWT_SECRET length:', JWT_SECRET.length);

// Connect to MongoDB
async function connectDB() {
  try {
    client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
    
    const db = client.db(DB_NAME);
    usersCollection = db.collection('users');
    
    // Create unique index on email
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    console.log('✅ Connected to MongoDB - Auth Service');
    console.log('   Database:', DB_NAME);
    console.log('   Collection: users');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

connectDB();

// ==================== REGISTER ====================

app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 6 characters'
      });
    }

    console.log('📝 Register:', email);

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name: name || 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ User registered:', email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: result.insertedId,
      email,
      name: name || 'User'
    });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// ==================== LOGIN ====================

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
    }

    console.log('🔐 Login attempt:', email);

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password'
      });
    }

    console.log('🔑 Signing token with JWT_SECRET:', JWT_SECRET);
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', email);
    console.log('📝 Token created (first 50 chars):', token.substring(0, 50));

    res.json({
      success: true,
      message: 'Login successful',
      token,
      userId: user._id,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// ==================== VERIFY TOKEN ====================

app.post('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        valid: false,
        error: true,
        message: 'No authorization header'
      });
    }

    const token = authHeader.split(' ')[1] || authHeader;

    console.log('🔑 Verifying token with JWT_SECRET:', JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log('✅ Token verified for user:', decoded.email);

    res.json({
      valid: true,
      userId: decoded.userId,
      email: decoded.email
    });
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    res.status(401).json({
      valid: false,
      error: true,
      message: 'Invalid or expired token'
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Auth Service',
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLING ====================

app.use((error, req, res, next) => {
  console.error('🔴 Error:', error);
  res.status(500).json({
    error: true,
    message: 'Internal Server Error'
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n✅ Auth Service running on http://localhost:${PORT}`);
  console.log('📊 Health check: http://localhost:5001/health\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (client) await client.close();
  process.exit(0);
});