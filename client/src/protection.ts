// server/middleware/protection.ts
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import xmlparser from 'express-xml-bodyparser';

export function setupSecurityMiddleware(app: express.Express) {
  app.use(helmet());
  app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  }));

  app.use(cors({
    origin: 'https://kaiserliche.my.id',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(xmlparser({
    normalize: true,
    normalizeTags: true,
    explicitArray: false,
    trim: true,
  }));

  const csrfProtection = csrf({ cookie: true });
  app.use(csrfProtection);

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: '🚫 Too many requests, slow down!',
  });
  app.use(limiter);

  // Optional: define a basic route here
  app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
}
