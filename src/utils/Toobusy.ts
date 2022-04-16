import { NextFunction, Request, Response } from 'express';
import tooBusy from 'toobusy-js';

export default function (req: Request, res: Response, next: NextFunction) {
  if (tooBusy()) {
    res.status(503).send('Server too busy!');
  } else {
    next();
  }
}

tooBusy.onLag(function (currentLag: any) {
  console.error('Event loop lag detected! Latency: ' + currentLag + 'ms');
});
