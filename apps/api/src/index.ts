import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import documentsRoutes from './routes/documents';
import biomarkersRoutes from './routes/biomarkers';
import checkinsRoutes from './routes/checkins';
import goalsRoutes from './routes/goals';
import priorityRoutes from './routes/priority';
import recommendationsRoutes from './routes/recommendations';
import timelineRoutes from './routes/timeline';
import weeklyReviewRoutes from './routes/weeklyReview';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger — shows every inbound request and its status
app.use((req, res, next) => {
  res.on('finish', () => {
    const level = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    console.log(`[${level}] ${req.method} ${req.path} → ${res.statusCode}`);
  });
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/biomarkers', biomarkersRoutes);
app.use('/api/checkins', checkinsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/priority', priorityRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/weekly-review', weeklyReviewRoutes);

// Bind to 0.0.0.0 so physical devices on the same WiFi can reach the server
app.listen(Number(PORT), '0.0.0.0', () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  const localIPs = Object.values(nets as any)
    .flat()
    .filter((n: any) => n.family === 'IPv4' && !n.internal)
    .map((n: any) => n.address);
  console.log(`✅ API server running on port ${PORT}`);
  console.log(`   Local:   http://localhost:${PORT}`);
  localIPs.forEach((ip: string) => {
    console.log(`   Network: http://${ip}:${PORT}  ← use this in .env.local on device`);
  });
});

export default app;
