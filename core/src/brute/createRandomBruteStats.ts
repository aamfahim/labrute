import { DestinyChoiceType, PetName, SkillName, WeaponName } from '@labrute/prisma';
import { BruteRankings, BRUTE_STARTING_POINTS } from '../constants';
import randomBetween from '../utils/randomBetween';
import applySkillModifiers from './applySkillModifiers';
import getHP from './getHP';
import getRandomBonus from './getRandomBonus';
import { pets } from './pets';

const createRandomBruteStats = (perkType?: DestinyChoiceType, perkName?: string | null) => {
  let brute = {
    level: 1,
    xp: 0,
    hp: 0,
    enduranceStat: 0,
    enduranceModifier: 1,
    enduranceValue: 0,
    strengthStat: 0,
    strengthModifier: 1,
    strengthValue: 0,
    agilityStat: 0,
    agilityModifier: 1,
    agilityValue: 0,
    speedStat: 0,
    speedModifier: 1,
    speedValue: 0,
    skills: [] as SkillName[],
    pets: [] as PetName[],
    ranking: BruteRankings[0],
    weapons: [] as WeaponName[],
  };

  // Starting budget
  let availablePoints = BRUTE_STARTING_POINTS;

  let perk: { type: DestinyChoiceType, name: PetName | SkillName | WeaponName } | null = null;

  // Predefined perk
  if (perkType && perkName) {
    perk = { type: perkType, name: perkName as PetName | SkillName | WeaponName };

    if (perkType === DestinyChoiceType.pet) {
      brute.pets = [perkName as PetName];
    } else if (perkType === DestinyChoiceType.skill) {
      brute.skills = [perkName as SkillName];
    } else {
      brute.weapons = [perkName as WeaponName];
    }
  } else {
    // Random perk
    perk = getRandomBonus(brute, true);

    if (!perk) {
      throw new Error('No bonus found');
    }

    // Pet
    brute.pets = perk.type === DestinyChoiceType.pet ? [perk.name as PetName] : [];
    // Skill
    brute.skills = perk.type === DestinyChoiceType.skill ? [perk.name as SkillName] : [];
    // Weapon
    brute.weapons = perk.type === DestinyChoiceType.weapon ? [perk.name as WeaponName] : [];
  }

  // Stats boosters
  if (perk.type === 'skill') {
    brute = applySkillModifiers(brute, brute.skills[0]);
  }

  // Enrudance (2 to 5)
  const endurancePoints = randomBetween(2, 5);
  brute.enduranceStat += endurancePoints;
  availablePoints -= endurancePoints;

  // Take into account the endurance malus from the pet
  if (perk.type === DestinyChoiceType.pet) {
    const pet = pets.find((p) => p.name === perk?.name);

    if (!pet) {
      throw new Error('Pet not found');
    }

    // Can go into negatives
    brute.enduranceStat -= pet.enduranceMalus;
  }

  // Strength (2 to 5)
  const strengthPoints = Math.min(randomBetween(2, 5), availablePoints - 2 * 2);
  brute.strengthStat += strengthPoints;
  availablePoints -= strengthPoints;

  // Agility (2 to 5)
  const agilityPoints = Math.min(randomBetween(2, 5), availablePoints - 2 * 1);
  brute.agilityStat += agilityPoints;
  availablePoints -= agilityPoints;

  // Speed (2 to 5)
  brute.speedStat += availablePoints;

  // Final stat values
  brute.enduranceValue = Math.floor(
    brute.enduranceStat * brute.enduranceModifier,
  );
  brute.strengthValue = Math.floor(
    brute.strengthStat * brute.strengthModifier,
  );
  brute.agilityValue = Math.floor(
    brute.agilityStat * brute.agilityModifier,
  );
  brute.speedValue = Math.floor(
    brute.speedStat * brute.speedModifier,
  );

  // Final HP
  brute.hp = getHP(1, brute.enduranceValue);

  return brute;
};

export default createRandomBruteStats;
