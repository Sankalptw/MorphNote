const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

// Email transporter configuration
let transporter;

function initializeTransporter() {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  if (emailService === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Generic SMTP configuration
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  console.log('✅ Email transporter configured');
}

initializeTransporter();

// ==================== SEND GENERIC EMAIL ====================

app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    // Validation
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        error: true,
        message: 'to, subject, and either text or html are required'
      });
    }

    console.log('📧 Sending email to:', to);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: text || '',
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent:', info.messageId);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Send email error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// ==================== WELCOME EMAIL ====================

app.post('/welcome', async (req, res) => {
  try {
    const { to, name } = req.body;

    if (!to || !name) {
      return res.status(400).json({
        error: true,
        message: 'to and name are required'
      });
    }

    console.log('👋 Sending welcome email to:', to);

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to MorphNote! 🎉</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with MorphNote. We're excited to have you on board!</p>
        <p>MorphNote is an AI-powered note enhancement platform that helps you:</p>
        <ul>
          <li>✍️ Stylize notes into multiple tones (formal, professional, creative, casual)</li>
          <li>📘 Summarize your notes automatically</li>
          <li>🔑 Extract key points from your content</li>
          <li>📄 Query PDFs with natural language</li>
        </ul>
        <p>Get started by creating your first note!</p>
        <p>Happy note-taking! 📝</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Welcome to MorphNote!',
      html: htmlTemplate
    });

    console.log('✅ Welcome email sent');

    res.json({
      success: true,
      message: 'Welcome email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// ==================== NOTE CREATED NOTIFICATION ====================

app.post('/note-created', async (req, res) => {
  try {
    const { to, noteTitle } = req.body;

    if (!to || !noteTitle) {
      return res.status(400).json({
        error: true,
        message: 'to and noteTitle are required'
      });
    }

    console.log('📝 Sending note creation notification to:', to);

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Note Created ✅</h2>
        <p>Your note <strong>"${noteTitle}"</strong> has been created successfully!</p>
        <p>You can now:</p>
        <ul>
          <li>Stylize it to different tones</li>
          <li>Summarize the content</li>
          <li>Extract key points</li>
          <li>Share it with others</li>
        </ul>
        <p>Start enhancing your note today!</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `New Note: "${noteTitle}"`,
      html: htmlTemplate
    });

    console.log('✅ Note creation notification sent');

    res.json({
      success: true,
      message: 'Notification sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Notification error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Notification Service',
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

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => {
  console.log(`\n✅ Notification Service running on http://localhost:${PORT}`);
  console.log('📊 Health check: http://localhost:5007/health\n');
});