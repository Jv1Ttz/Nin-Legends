import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.js';
import { characterRoutes } from './routes/character.js';
import { gameRoutes } from './routes/game.js';
import { missionRoutes } from './routes/mission.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.VERCEL
  ? [process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '']
  : ['http://localhost:5173'];

app.use(cors({
  origin: (_origin, callback) => {
    if (process.env.VERCEL) {
      callback(null, true);
    } else {
      callback(null, allowedOrigins);
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/missions', missionRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'Nin Legends API' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Global Error]', err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Erro interno do servidor', detail: err.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Nin Legends] Server running on http://localhost:${PORT}`);
  });
}

export default app;
