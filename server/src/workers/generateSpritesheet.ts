import { BruteWithBodyColors, SPRITESHEET_VERSION, getBruteVisuals } from '@labrute/core';
import { Prisma } from '@labrute/prisma';
import { workerData } from 'worker_threads';
import createSpritesheet from '../utils/createSpritesheet.js';
import formatSpritesheet from '../utils/formatSpritesheet.js';
import startJob from './startJob.js';
import { GLOBAL, ServerContext } from '../context.js';

async function main(cx: ServerContext) {
  const {
    payload: brute,
    jobId,
  } = workerData as {
    payload: BruteWithBodyColors;
    jobId: number;
  };

  cx.logger.info('generateSpritesheet: start');

  try {
    const visuals = getBruteVisuals(brute);

    // Check if spritesheet already exists
    const count = await cx.prisma.bruteSpritesheet.count({
      where: {
        ...visuals,
        version: SPRITESHEET_VERSION,
      },
    });

    if (count > 0) {
      throw new Error(`Spritesheet already exists for ${brute.name}`);
    }

    // Create spritesheet
    const spritesheet = await createSpritesheet(visuals);

    // Delete outdated spritesheet
    await cx.prisma.bruteSpritesheet.deleteMany({
      where: {
        ...visuals,
        version: { not: SPRITESHEET_VERSION },
      },
    });

    await cx.prisma.bruteSpritesheet.create({
      data: {
        image: spritesheet.image,
        json: formatSpritesheet(spritesheet, visuals) as unknown as Prisma.JsonObject,
        ...visuals,
      },
      select: { id: true },
    });
  } catch (error) {
    cx.logger.error(error);
  } finally {
    // Delete job
    await cx.prisma.workerJob.delete({ where: { id: jobId } });

    // Start the next job
    await startJob(cx.prisma);
  }

  cx.logger.info('generateSpritesheet: end');
}

/**
 * Initialize the global context, then run `main`
 */
async function mainWrapper() {
  await using context = GLOBAL;
  await main(context);
}

await mainWrapper();
