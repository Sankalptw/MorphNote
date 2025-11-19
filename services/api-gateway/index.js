const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  NOTES: process.env.NOTES_SERVICE_URL || 'http://localhost:5002',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5007'
};

console.log('🚀 API Gateway Configuration:');
console.log('   Auth Service:', SERVICES.AUTH);
console.log('   Notes Service:', SERVICES.NOTES);
console.log('   Notification Service:', SERVICES.NOTIFICATION);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    gateway: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    services: SERVICES
  });
});


app.post('/api/auth/register', async (req, res, next) => {
  try {
    console.log('📝 Register request:', req.body.email);
    const response = await axios.post(`${SERVICES.AUTH}/register`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('❌ Register error:', error.message);
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    console.log('🔐 Login request:', req.body.email);
    const response = await axios.post(`${SERVICES.AUTH}/login`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Login error:', error.message);
    next(error);
  }
});

app.post('/api/auth/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.post(`${SERVICES.AUTH}/verify`, {}, {
      headers: { authorization: token }
    });
    res.json(response.data);
  } catch (error) {
    console.error('❌ Verify error:', error.message);
    next(error);
  }
});


app.post('/api/notes', async (req, res, next) => {
  try {
    console.log('📝 Create note');
    const token = req.headers.authorization;
    const userId = req.body.userId || 'default-user';
    
    const response = await axios.post(`${SERVICES.NOTES}/notes`, req.body, {
      headers: {
        authorization: token,
        'x-user-id': userId
      }
    });
    res.status(201).json(response.data);
  } catch (error) {
    console.error('❌ Create note error:', error.message);
    next(error);
  }
});

app.get('/api/notes', async (req, res, next) => {
  try {
    console.log('📖 Get all notes');
    const token = req.headers.authorization;
    const userId = req.query.userId || 'default-user';
    
    const response = await axios.get(`${SERVICES.NOTES}/notes`, {
      headers: {
        authorization: token,
        'x-user-id': userId
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('❌ Get notes error:', error.message);
    next(error);
  }
});

app.get('/api/notes/:id', async (req, res, next) => {
  try {
    console.log('📄 Get note:', req.params.id);
    const token = req.headers.authorization;
    const userId = req.query.userId || 'default-user';
    
    const response = await axios.get(`${SERVICES.NOTES}/notes/${req.params.id}`, {
      headers: {
        authorization: token,
        'x-user-id': userId
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('❌ Get note error:', error.message);
    next(error);
  }
});

app.put('/api/notes/:id', async (req, res, next) => {
  try {
    console.log('✏️ Update note:', req.params.id);
    const token = req.headers.authorization;
    const userId = req.body.userId || 'default-user';
    
    const response = await axios.put(`${SERVICES.NOTES}/notes/${req.params.id}`, req.body, {
      headers: {
        authorization: token,
        'x-user-id': userId
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('❌ Update note error:', error.message);
    next(error);
  }
});

app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    console.log('🗑️ Delete note:', req.params.id);
    const token = req.headers.authorization;
    const userId = req.query.userId || 'default-user';
    
    const response = await axios.delete(`${SERVICES.NOTES}/notes/${req.params.id}`, {
      headers: {
        authorization: token,
        'x-user-id': userId
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('❌ Delete note error:', error.message);
    next(error);
  }
});


app.use((error, req, res, next) => {
  console.error('🔴 Error:', error.message);
  
  const status = error.response?.status || error.status || 500;
  const message = error.response?.data?.error || error.message || 'Internal Server Error';
  
  res.status(status).json({
    error: true,
    status,
    message,
    service: error.config?.url,
    timestamp: new Date().toISOString()
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ API Gateway running on http://localhost:${PORT}`);
  console.log('📊 Health check: http://localhost:5000/health\n');
});