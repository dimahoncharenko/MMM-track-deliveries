import { Config } from './config.interface';

export const config = (): Config => ({
  NP_APP_KEY: process.env.NP_APP_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEFAULT_TRACK_PHONE: process.env.DEFAULT_TRACK_PHONE,
  NP_API_URL: process.env.NP_API_URL,
});
