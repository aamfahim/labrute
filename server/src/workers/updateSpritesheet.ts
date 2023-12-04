import { BruteVisuals, SPRITESHEET_VERSION } from '@labrute/core';
import { Prisma, PrismaClient } from '@labrute/prisma';
import { workerData } from 'worker_threads';
import createSpritesheet from '../utils/createSpritesheet.js';
import formatSpritesheet from '../utils/formatSpritesheet.js';
import DiscordUtils from '../utils/DiscordUtils.js';

const visuals = workerData as BruteVisuals;
const prisma = new PrismaClient();

try {
  // Check if spritesheet already exists
  const count = await prisma.bruteSpritesheet.count({
    where: {
      ...visuals,
      version: SPRITESHEET_VERSION,
    },
  });

  if (count > 0) {
    throw new Error('Spritesheet already exists');
  }

  await DiscordUtils.sendLog(`Updating spritesheet for \`${JSON.stringify(visuals)}\``);

  // Create spritesheet
  const spritesheet = await createSpritesheet(visuals);

  // Update spritesheet
  await prisma.bruteSpritesheet.update({
    where: {
      // eslint-disable-next-line max-len
      gender_longHair_lowerRightArm_rightHand_upperRightArm_rightShoulder_rightFoot_lowerRightLeg_upperRightLeg_leftFoot_lowerLeftLeg_pelvis_upperLeftLeg_tummy_torso_head_leftHand_upperLeftArm_lowerLeftArm_leftShoulder_skinColor_skinShade_hairColor_hairShade_primaryColor_primaryShade_secondaryColor_secondaryShade_accentColor_accentShade: visuals,
    },
    data: {
      image: spritesheet.image,
      json: formatSpritesheet(spritesheet, visuals) as unknown as Prisma.JsonObject,
      version: SPRITESHEET_VERSION,
    },
    select: { id: true },
  });

  await DiscordUtils.sendLog('Updated spritesheet');
} catch (error) { /* ignore */ }