import express from 'express';

import { Version } from '@labrute/core';
import bodyParser from 'body-parser';
import schedule from 'node-schedule';
import dailyJob from './dailyJob.js';
import './i18n.js';
import initRoutes from './routes.js';
import Env from './utils/Env.js';
import startJob from './workers/startJob.js';
import { GLOBAL, ServerContext } from './context.js';

function main(cx: ServerContext) {
  cx.logger.info(`start server v${Version}`);

  const app = express();
  const port = Env.PORT;

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  app.listen(port, () => {
    cx.logger.info('server started, listening');

    // Trigger daily job
    dailyJob(cx.prisma)().catch((error: Error) => {
      cx.discord.sendError(error);
    });

    // Initialize daily scheduler
    schedule.scheduleJob('0 0 * * *', dailyJob(cx.prisma));

    // Start worker queue
    startJob(cx.prisma).catch((error: Error) => {
      cx.discord.sendError(error);
    });
  });

  initRoutes(app, cx.prisma);
}

/**
 * Initialize the global context, then run `main`
 */
async function mainWrapper() {
  await using context = GLOBAL;
  main(context);
}

await mainWrapper();
