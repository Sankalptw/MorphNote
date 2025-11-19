const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'morphnote_notes';

let client;
let notesCollection;

// Connect to MongoDB
async function connectDB() {
  try {
    client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
    
    const db = client.db(DB_NAME);
    notesCollection = db.collection('notes');
    
    await notesCollection.createIndex({ userId: 1, createdAt: -1 });
    
    console.log('✅ Connected to MongoDB - Notes Service');
    console.log('   Database:', DB_NAME);
    console.log('   Collection: notes');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

connectDB();


const extractUser = (req, res, next) => {
  const auth = req.headers.authorization;
  const userId = req.headers['x-user-id'];
  
  if (!auth || !userId) {
    return res.status(401).json({
      error: true,
      message: 'Authorization required'
    });
  }
  
  req.userId = userId;
  next();
};


app.post('/notes', extractUser, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: true,
        message: 'Title and content are required'
      });
    }

    console.log('📝 Creating note for user:', req.userId);

    const result = await notesCollection.insertOne({
      userId: req.userId,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Note created:', result.insertedId);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      noteId: result.insertedId,
      note: {
        _id: result.insertedId,
        userId: req.userId,
        title,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Create note error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});


app.get('/notes', extractUser, async (req, res) => {
  try {
    console.log('📖 Fetching notes for user:', req.userId);

    const notes = await notesCollection
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Found ${notes.length} notes`);

    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('❌ Get notes error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});


app.get('/notes/:id', extractUser, async (req, res) => {
  try {
    console.log('📄 Fetching note:', req.params.id);

    // Validate ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid note ID'
      });
    }

    const note = await notesCollection.findOne({
      _id: new ObjectId(req.params.id),
      userId: req.userId
    });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: 'Note not found'
      });
    }

    console.log('✅ Note found');

    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('❌ Get note error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});


app.put('/notes/:id', extractUser, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({
        error: true,
        message: 'At least title or content is required'
      });
    }

    console.log('✏️ Updating note:', req.params.id);

    // Validate ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid note ID'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    updateData.updatedAt = new Date();

    const result = await notesCollection.updateOne(
      { _id: new ObjectId(req.params.id), userId: req.userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: true,
        message: 'Note not found'
      });
    }

    console.log('✅ Note updated');

    res.json({
      success: true,
      message: 'Note updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Update note error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});


app.delete('/notes/:id', extractUser, async (req, res) => {
  try {
    console.log('🗑️ Deleting note:', req.params.id);

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid note ID'
      });
    }

    const result = await notesCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      userId: req.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: true,
        message: 'Note not found'
      });
    }

    console.log('✅ Note deleted');

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete note error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});


app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Notes Service',
    timestamp: new Date().toISOString()
  });
});


app.use((error, req, res, next) => {
  console.error('🔴 Error:', error);
  res.status(500).json({
    error: true,
    message: 'Internal Server Error'
  });
});


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`\n✅ Notes Service running on http://localhost:${PORT}`);
  console.log('📊 Health check: http://localhost:5002/health\n');
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (client) await client.close();
  process.exit(0);
});