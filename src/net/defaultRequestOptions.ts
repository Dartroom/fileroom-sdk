import { RequestOptions } from '../interfaces';

export const TestOpts: RequestOptions = {
  host: 'localhost',
  port: 3001,
  protocol: 'http',
  path: '/',
  timeout: 60000,
};

export const ProdOpts: RequestOptions = {
  host: 'beta-ams-1.fileroom.app',
  path: '/',
  protocol: 'https',
  timeout: 60000,
};

export const BetaOpts: RequestOptions = {
  host: 'beta.fileroom.app',  
  path: '/',
  protocol: 'https',
  timeout: 60000,
};