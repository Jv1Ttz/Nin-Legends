import { prisma } from '../lib/prisma.js';

export interface GameCommand {
  type: string;
  value: string;
}

export interface CombatEnemy {
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  type: string;
}

export function parseCommands(narrative: string): GameCommand[] {
  const commands: GameCommand[] = [];
  const regex =
    /\[(DICE|DAMAGE|HEAL|CHAKRA_USE|CHAKRA_RESTORE|XP|RYOU|ITEM_ADD|ITEM_REMOVE|LOCATION|COMBAT_START|COMBAT_END|MISSION_START|MISSION_COMPLETE|LEVEL_UP|IMAGE|ENEMY|ENEMY_DAMAGE|JUTSU_LEARN|ELEMENT_UNLOCK):?([^\]]*)\]/g;
  let match;

  while ((match = regex.exec(narrative)) !== null) {
    commands.push({ type: match[1], value: match[2]?.trim() || '' });
  }
  return commands;
}

export function parseChoices(narrative: string): string[] {
  const choices: string[] = [];
  const regex = /\[CHOICE:([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(narrative)) !== null) {
    choices.push(match[1].trim());
  }
  return choices;
}

export function stripCommands(narrative: string): string {
  return narrative
    .replace(
      /\[(DICE|DAMAGE|HEAL|CHAKRA_USE|CHAKRA_RESTORE|XP|RYOU|ITEM_ADD|ITEM_REMOVE|LOCATION|COMBAT_START|COMBAT_END|MISSION_START|MISSION_COMPLETE|LEVEL_UP|IMAGE|ENEMY|ENEMY_DAMAGE|JUTSU_LEARN|ELEMENT_UNLOCK):[^\]]*\]/g,
      ''
    )
    .replace(/\[(COMBAT_START|COMBAT_END|LEVEL_UP)\]/g, '')
    .replace(/\[CHOICE:[^\]]*\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function rollDice(diceExpr: string): { total: number; rolls: number[]; expression: string } {
  const match = diceExpr.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return { total: 0, rolls: [], expression: diceExpr };

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = rolls.reduce((a, b) => a + b, 0) + modifier;
  return { total, rolls, expression: diceExpr };
}

const XP_TABLE: Record<string, { rank: string; xpNeeded: number }> = {
  '5': { rank: 'Genin', xpNeeded: 500 },
  '15': { rank: 'Chunin', xpNeeded: 2000 },
  '30': { rank: 'Jounin', xpNeeded: 5000 },
  '50': { rank: 'ANBU', xpNeeded: 12000 },
  '80': { rank: 'Kage', xpNeeded: 30000 },
};

export async function processCommands(
  characterId: string,
  commands: GameCommand[],
  sessionId: string,
  currentInCombat: boolean = false
): Promise<{
  diceResults: { total: number; rolls: number[]; expression: string }[];
  stateChanges: Record<string, unknown>;
  combatLog: string[];
  imagePrompt: string | null;
  newMissions: { rank: string; title: string; description: string }[];
  completedMissions: string[];
  enemies: CombatEnemy[];
  inCombat: boolean;
}> {
  const result = {
    diceResults: [] as { total: number; rolls: number[]; expression: string }[],
    stateChanges: {} as Record<string, unknown>,
    combatLog: [] as string[],
    imagePrompt: null as string | null,
    newMissions: [] as { rank: string; title: string; description: string }[],
    completedMissions: [] as string[],
    enemies: [] as CombatEnemy[],
    inCombat: currentInCombat,
  };

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: { inventory: true },
  });
  if (!character) return result;

  let hpDelta = 0;
  let chakraDelta = 0;
  let xpDelta = 0;
  let ryouDelta = 0;
  let newLocation: string | null = null;
  let jutsuList: string[] = [];
  let extraElements: string[] = Array.isArray((character as any).extraElements)
    ? // clone para não mutar referência direta do Prisma
      [...((character as any).extraElements as string[])]
    : [];
  try {
    jutsuList = JSON.parse(character.jutsus || '[]');
    if (!Array.isArray(jutsuList)) jutsuList = [];
  } catch {
    jutsuList = [];
  }

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'DICE': {
        // Rolagem automática feita pelo servidor, a partir da expressão enviada pela IA.
        const roll = rollDice(cmd.value);
        result.diceResults.push(roll);
        result.combatLog.push(
          `Rolagem: ${roll.expression} = ${roll.total}` +
            (roll.rolls.length ? ` (dados: ${roll.rolls.join(', ')})` : '')
        );
        break;
      }
      case 'DAMAGE': {
        const dmg = parseInt(cmd.value) || 0;
        hpDelta -= dmg;
        result.combatLog.push(`Dano recebido: -${dmg} HP`);
        break;
      }
      case 'HEAL': {
        const heal = parseInt(cmd.value) || 0;
        hpDelta += heal;
        result.combatLog.push(`Cura: +${heal} HP`);
        break;
      }
      case 'CHAKRA_USE': {
        const cost = parseInt(cmd.value) || 0;
        chakraDelta -= cost;
        result.combatLog.push(`Chakra utilizado: -${cost}`);
        break;
      }
      case 'CHAKRA_RESTORE': {
        const restore = parseInt(cmd.value) || 0;
        chakraDelta += restore;
        result.combatLog.push(`Chakra restaurado: +${restore}`);
        break;
      }
      case 'XP': {
        const xp = parseInt(cmd.value) || 0;
        xpDelta += xp;
        result.combatLog.push(`XP ganho: +${xp}`);
        break;
      }
      case 'RYOU': {
        const money = parseInt(cmd.value) || 0;
        ryouDelta += money;
        result.combatLog.push(`Ryou ganho: +${money}`);
        break;
      }
      case 'LOCATION': {
        newLocation = cmd.value;
        break;
      }
      case 'IMAGE': {
        result.imagePrompt = cmd.value;
        break;
      }
      case 'COMBAT_START': {
        result.inCombat = true;
        result.combatLog.push('--- COMBATE INICIADO ---');
        break;
      }
      case 'COMBAT_END': {
        result.inCombat = false;
        result.enemies = [];
        result.combatLog.push('--- COMBATE ENCERRADO ---');
        break;
      }
      case 'ENEMY': {
        const parts = cmd.value.split('|');
        if (parts.length >= 4) {
          const maxHp = parseInt(parts[2]) || 100;
          result.enemies.push({
            name: parts[0].trim(),
            hp: parseInt(parts[1]) || maxHp,
            maxHp,
            level: parseInt(parts[3]) || 1,
            type: parts[4]?.trim() || 'ninja',
          });
          result.combatLog.push(`Inimigo: ${parts[0].trim()} (HP: ${parts[1]}/${parts[2]}, Nv.${parts[3]})`);
        }
        break;
      }
      case 'ENEMY_DAMAGE': {
        const [eName, eDmg] = cmd.value.split('|');
        const dmgVal = parseInt(eDmg) || 0;
        const enemy = result.enemies.find(e => e.name === eName?.trim());
        if (enemy) {
          enemy.hp = Math.max(0, enemy.hp - dmgVal);
          result.combatLog.push(`${enemy.name} recebeu -${dmgVal} HP (${enemy.hp}/${enemy.maxHp})`);
        }
        break;
      }
      case 'ITEM_ADD': {
        const parts = cmd.value.split('|');
        if (parts.length >= 4) {
          await prisma.inventoryItem.create({
            data: {
              characterId,
              name: parts[0].trim(),
              type: parts[1].trim(),
              description: parts[2].trim(),
              quantity: parseInt(parts[3]) || 1,
            },
          });
          result.combatLog.push(`Item obtido: ${parts[0].trim()}`);
        }
        break;
      }
      case 'ITEM_REMOVE': {
        const [itemName, qty] = cmd.value.split('|');
        const item = character.inventory.find(i => i.name === itemName?.trim());
        if (item) {
          const removeQty = parseInt(qty) || 1;
          if (item.quantity <= removeQty) {
            await prisma.inventoryItem.delete({ where: { id: item.id } });
          } else {
            await prisma.inventoryItem.update({ where: { id: item.id }, data: { quantity: item.quantity - removeQty } });
          }
          result.combatLog.push(`Item usado/perdido: ${itemName?.trim()}`);
        }
        break;
      }
      case 'MISSION_START': {
        const mParts = cmd.value.split('|');
        if (mParts.length >= 3) {
          await prisma.mission.create({
            data: {
              characterId,
              rank: mParts[0].trim(),
              title: mParts[1].trim(),
              description: mParts[2].trim(),
              xpReward: parseInt(mParts[3]) || 50,
              ryouReward: parseInt(mParts[4]) || 100,
              status: 'active',
            },
          });
          result.newMissions.push({
            rank: mParts[0].trim(),
            title: mParts[1].trim(),
            description: mParts[2].trim(),
          });
        }
        break;
      }
      case 'MISSION_COMPLETE': {
        const mission = await prisma.mission.findFirst({
          where: { characterId, title: cmd.value, status: 'active' },
        });
        if (mission) {
          await prisma.mission.update({ where: { id: mission.id }, data: { status: 'completed' } });
          xpDelta += mission.xpReward;
          ryouDelta += mission.ryouReward;
          result.completedMissions.push(mission.title);
          result.combatLog.push(`Missão completada: ${mission.title} (+${mission.xpReward} XP, +${mission.ryouReward} Ryou)`);
        }
        break;
      }
      case 'JUTSU_LEARN': {
        const jutsuName = cmd.value.trim();
        if (jutsuName && !jutsuList.includes(jutsuName)) {
          jutsuList.push(jutsuName);
          result.combatLog.push(`Novo jutsu aprendido: ${jutsuName}`);
        }
        break;
      }
      case 'ELEMENT_UNLOCK': {
        const elem = cmd.value.trim();
        if (elem && !extraElements.includes(elem)) {
          extraElements.push(elem);
          result.combatLog.push(`Nova natureza de chakra despertada: ${elem}`);
        }
        break;
      }
    }
  }

  const newHp = Math.max(0, Math.min(character.maxHp, character.hp + hpDelta));
  const newChakra = Math.max(0, Math.min(character.maxChakra, character.chakra + chakraDelta));
  const newXp = character.xp + xpDelta;
  const newRyou = character.ryou + ryouDelta;

  let newLevel = character.level;
  let xpToNext = character.xpToNext;
  let currentXp = newXp;
  let shouldLevelUp = false;
  let levelsGained = 0;

  while (currentXp >= xpToNext) {
    currentXp -= xpToNext;
    newLevel++;
    xpToNext = Math.floor(xpToNext * 1.3);
    shouldLevelUp = true;
    levelsGained++;
  }

  let newRank = character.rank;
  for (const [lvl, data] of Object.entries(XP_TABLE)) {
    if (newLevel >= parseInt(lvl)) {
      newRank = data.rank;
    }
  }

  const updateData: Record<string, unknown> = {
    hp: newHp,
    chakra: newChakra,
    xp: currentXp,
    xpToNext,
    ryou: newRyou,
    level: newLevel,
    rank: newRank,
    jutsus: JSON.stringify(jutsuList),
  };

  if (extraElements.length) {
    updateData.extraElements = extraElements;
  }

  if (shouldLevelUp) {
    const attrPointsGain = levelsGained * 2;
    updateData.maxHp = character.maxHp + 10 * levelsGained;
    updateData.maxChakra = character.maxChakra + 10 * levelsGained;
    updateData.attrPoints = (character.attrPoints || 0) + attrPointsGain;
    result.combatLog.push(
      `LEVEL UP! Nível ${newLevel}! Rank: ${newRank} (+${attrPointsGain} pontos de atributo para distribuir).`
    );
  }

  await prisma.character.update({ where: { id: characterId }, data: updateData });

  if (newLocation) {
    await prisma.gameSession.update({ where: { id: sessionId }, data: { currentLocation: newLocation } });
    result.stateChanges['location'] = newLocation;
  }

  result.stateChanges['hp'] = newHp;
  result.stateChanges['chakra'] = newChakra;
  result.stateChanges['xp'] = currentXp;
  result.stateChanges['level'] = newLevel;
  result.stateChanges['rank'] = newRank;
  result.stateChanges['ryou'] = newRyou;
  result.stateChanges['inCombat'] = result.inCombat;

  return result;
}
