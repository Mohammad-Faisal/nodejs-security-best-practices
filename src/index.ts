import express, { Application, Request, Response } from 'express';
import Config from './utils/Config';
import bodyParser from 'body-parser';
import cors from './utils/CorsProtection';
import compression from 'compression';
import helmet from 'helmet';
import xss from 'xss-clean';
import tooBusy from './utils/Toobusy';
import rateLimiter from './utils/RateLimiter';
import httpsEnforcer from './utils/HttpsEnforcer';

const app: Application = express();

app.use(cors);
app.use(xss());
app.use(bodyParser.json({ limit: '50kb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(rateLimiter);
app.use(tooBusy);
app.use(httpsEnforcer);

try {
  app.listen(Config.port, (): void => {
    console.log(`Connected successfully on port ${Config.port}`);
  });
} catch (error: any) {
  console.error(`Error occured: ${error.message}`);
}
