import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { generateNarrative, generateImage } from '../services/aiService.js';
import { buildSystemPrompt, OPENING_INSTRUCTION } from '../prompts/narutoMaster.js';
import { parseCommands, parseChoices, processCommands, stripCommands } from '../services/gameEngine.js';
import { prisma } from '../lib/prisma.js';
import { getClanById } from '../data/clans.js';

const router = Router();

router.post('/start', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { characterId } = req.body;
    const character = await prisma.character.findFirst({
      where: { id: characterId, userId: req.userId! },
      include: { inventory: true },
    });
    if (!character) {
      res.status(404).json({ error: 'Personagem não encontrado' });
      return;
    }

    const existingSession = await prisma.gameSession.findFirst({
      where: { characterId, isActive: true },
      include: { messages: { orderBy: { timestamp: 'desc' }, take: 20 } },
    });

    if (existingSession) {
      const charData = await prisma.character.findUnique({
        where: { id: characterId },
        include: { inventory: true, missions: { where: { status: 'active' } } },
      });
      res.json({
        session: existingSession,
        messages: existingSession.messages.reverse(),
        character: charData,
      });
      return;
    }

    const session = await prisma.gameSession.create({
      data: { characterId, currentLocation: character.village === 'Konoha' ? 'Vila da Folha' : character.village },
    });

    const clanInfo = character.clan ? getClanById(character.clan) : undefined;
    const systemPrompt = buildSystemPrompt({
      ...character,
      clanPassive: clanInfo?.passive,
      jutsus: JSON.parse(character.jutsus),
      inventory: character.inventory.map(i => ({ name: i.name, quantity: i.quantity })),
      currentLocation: session.currentLocation,
    });

    const narrative = await generateNarrative(systemPrompt, [], OPENING_INSTRUCTION);
    const commands = parseCommands(narrative);
    const choices = parseChoices(narrative);
    const gameResult = await processCommands(characterId, commands, session.id, false);
    const cleanNarrative = stripCommands(narrative);

    let imageUrl: string | null = null;
    if (gameResult.imagePrompt) {
      imageUrl = await generateImage(gameResult.imagePrompt);
    }

    await prisma.messageHistory.create({
      data: { sessionId: session.id, role: 'assistant', content: cleanNarrative, imageUrl },
    });

    const updatedChar = await prisma.character.findUnique({
      where: { id: characterId },
      include: { inventory: true, missions: { where: { status: 'active' } } },
    });

    res.json({
      session,
      narrative: cleanNarrative,
      imageUrl,
      character: updatedChar,
      choices,
      diceResults: gameResult.diceResults,
      combatLog: gameResult.combatLog,
      stateChanges: gameResult.stateChanges,
      enemies: gameResult.enemies,
      inCombat: gameResult.inCombat,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Game start error:', message);
    res.status(500).json({ error: 'Erro ao iniciar jogo', detail: message });
  }
});

router.post('/action', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, action, inCombat } = req.body as { sessionId: string; action: string; inCombat?: boolean };

    const session = await prisma.gameSession.findFirst({
      where: { id: sessionId, character: { userId: req.userId! }, isActive: true },
      include: { character: { include: { inventory: true } }, messages: { orderBy: { timestamp: 'desc' }, take: 20 } },
    });

    if (!session) {
      res.status(404).json({ error: 'Sessão não encontrada' });
      return;
    }

    const { character } = session;

    await prisma.messageHistory.create({
      data: { sessionId, role: 'user', content: action },
    });

    const clanInfo = character.clan ? getClanById(character.clan) : undefined;
    const systemPrompt = buildSystemPrompt({
      ...character,
      clanPassive: clanInfo?.passive,
      jutsus: JSON.parse(character.jutsus),
      inventory: character.inventory.map(i => ({ name: i.name, quantity: i.quantity })),
      currentLocation: session.currentLocation,
    });

    const history = session.messages.reverse().map(m => ({ role: m.role, content: m.content }));

    const narrative = await generateNarrative(systemPrompt, history, action);
    const commands = parseCommands(narrative);
    const choices = parseChoices(narrative);
    const gameResult = await processCommands(character.id, commands, sessionId, inCombat ?? false);
    const cleanNarrative = stripCommands(narrative);

    let imageUrl: string | null = null;
    if (gameResult.imagePrompt) {
      imageUrl = await generateImage(gameResult.imagePrompt);
    }

    await prisma.messageHistory.create({
      data: { sessionId, role: 'assistant', content: cleanNarrative, imageUrl },
    });

    const updatedChar = await prisma.character.findUnique({
      where: { id: character.id },
      include: { inventory: true, missions: true },
    });

    res.json({
      narrative: cleanNarrative,
      imageUrl,
      character: updatedChar,
      choices,
      diceResults: gameResult.diceResults,
      combatLog: gameResult.combatLog,
      stateChanges: gameResult.stateChanges,
      newMissions: gameResult.newMissions,
      completedMissions: gameResult.completedMissions,
      enemies: gameResult.enemies,
      inCombat: gameResult.inCombat,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Game action error:', message);
    res.status(500).json({ error: 'Erro ao processar ação', detail: message });
  }
});

router.get('/session/:sessionId/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const messages = await prisma.messageHistory.findMany({
      where: {
        sessionId,
        session: { character: { userId: req.userId! } },
      },
      orderBy: { timestamp: 'asc' },
    });
    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

export { router as gameRoutes };
