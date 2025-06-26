// protection.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const xmlparser = require('express-xml-bodyparser');

const app = express();

// 🔒 Helmet: Secure headers
app.use(helmet());
app.use(helmet.hsts({
  maxAge: 31536000, // 1 tahun
  includeSubDomains: true,
  preload: true
}));

// 🔐 CORS: Batasi asal permintaan
app.use(cors({
  origin: 'https://kaiserliche.my.id',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 🧃 Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xmlparser({
  normalize: true,
  normalizeTags: true,
  explicitArray: false,
  trim: true
}));

// 🛡️ CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// 💥 Rate Limiting - Anti DoS
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 30, // Maksimum 30 request/menit per IP
  message: '🚫 Too many requests, slow down!'
});
app.use(limiter);

// ✅ Example route with CSRF token
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ XML Endpoint (Anti XXE via express-xml-bodyparser)
app.post('/api/xml', (req, res) => {
  if (!req.body) return res.status(400).send('No XML provided');
  res.json({ received: req.body });
});

module.exports = app;
