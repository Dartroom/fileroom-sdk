import { RequestOptions } from '../interfaces';

export const TestOpts: RequestOptions = {
  host: 'localhost',
  port: 3001,
  protocol: 'http',
  path: '/',
  timeout: 60000,
};

export const ProdOpts: RequestOptions = {
  host: 'api.fileroom.app',
  path: '/',
  protocol: 'https',
  timeout: 60000,
};
