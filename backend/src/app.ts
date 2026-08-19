import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { config } from './config';
import authRoutes from './modules/auth/auth.routes';
import sendersRoutes from './modules/senders/senders.routes';
import campaignsRoutes from './modules/campaigns/campaigns.routes';
import emailsRoutes from './modules/emails/emails.routes';
import vaultRoutes from './modules/vault/vault.routes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(
  cors({
    origin: [config.frontendUrl, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-Mode'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Aerovox Dispatch Engine API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/senders', sendersRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/emails', emailsRoutes);
app.use('/api/vault', vaultRoutes);

app.use(errorHandler);
