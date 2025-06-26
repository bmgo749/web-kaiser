import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import xmlparser from 'express-xml-bodyparser';

const app = express();

// ✅ Helmet - Anti XSS, HSTS, dan secure headers
app.use(helmet());
app.use(helmet.hsts({
  maxAge: 31536000, // 1 tahun
  includeSubDomains: true,
  preload: true
}));

// ✅ CORS - Batasi domain frontend
app.use(cors({
  origin: 'https://kaiserliche.my.id',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ Parser - JSON, URL-Encoded, Cookie, dan XML (dengan Anti XXE)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xmlparser({
  normalize: true,
  normalizeTags: true,
  explicitArray: false,
  trim: true
}));

// ✅ Rate Limiting - Anti DoS
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 30, // Maksimal 30 request/menit/IP
  message: '🚫 Too many requests, please slow down.'
});
app.use(limiter);

// ✅ CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// ✅ Endpoint untuk ambil token CSRF
app.get('/csrf-token', (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ Endpoint XML (Anti XXE)
app.post('/api/xml', (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).send('No XML provided');
  }
  res.json({ received: req.body });
});

// 🔁 Error handler untuk CSRF
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next(err);
});

export default app;
