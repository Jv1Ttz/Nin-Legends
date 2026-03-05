import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { getClanById, getClansByVillage, getClansGroupedByVillage, CLANS } from '../data/clans.js';
import { generateImage } from '../services/aiService.js';

const router = Router();

const VILLAGES = ['Konoha', 'Suna', 'Kiri', 'Kumo', 'Iwa'];
const ELEMENTS = ['Katon', 'Suiton', 'Doton', 'Fuuton', 'Raiton'];

const STARTER_JUTSUS: Record<string, string[]> = {
  Katon: ['Katon: Goukakyuu no Jutsu'],
  Suiton: ['Suiton: Mizurappa'],
  Doton: ['Doton: Doryuuheki'],
  Fuuton: ['Fuuton: Daitoppa'],
  Raiton: ['Raiton: Jibashi'],
};

const BASE_JUTSUS = ['Bunshin no Jutsu', 'Henge no Jutsu', 'Kawarimi no Jutsu'];

const STARTER_ITEMS = [
  { name: 'Kunai', type: 'weapon', description: 'Lâmina ninja básica de arremesso', quantity: 5, effect: '{"damage": 3}' },
  { name: 'Shuriken', type: 'weapon', description: 'Estrela de arremesso ninja', quantity: 10, effect: '{"damage": 2}' },
  { name: 'Pílula de Soldado', type: 'consumable', description: 'Restaura 30 de chakra', quantity: 3, effect: '{"chakra": 30}' },
  { name: 'Bandagem', type: 'consumable', description: 'Restaura 20 de HP', quantity: 3, effect: '{"hp": 20}' },
];

const BASE_STATS = {
  hp: 100, maxHp: 100, chakra: 100, maxChakra: 100,
  ninjutsu: 5, taijutsu: 5, genjutsu: 5, velocidade: 5, resistencia: 5, inteligencia: 5,
};

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, village, element, clan: clanId, appearance } = req.body as {
      name: string;
      village: string;
      element: string;
      clan: string;
      appearance?: string;
    };
    const userId = req.userId!;

    if (!name || !village || !element || !clanId) {
      res.status(400).json({ error: 'Nome, vila, clã e elemento são obrigatórios' });
      return;
    }
    if (!VILLAGES.includes(village)) {
      res.status(400).json({ error: 'Vila inválida', validVillages: VILLAGES });
      return;
    }
    if (!ELEMENTS.includes(element)) {
      res.status(400).json({ error: 'Elemento inválido', validElements: ELEMENTS });
      return;
    }

    const clanData = getClanById(clanId);
    if (!clanData || clanData.village !== village) {
      const validClans = getClansByVillage(village).map((c) => c.id);
      res.status(400).json({ error: 'Clã inválido para esta vila', validClans });
      return;
    }

    const mods = clanData.modifiers;
    const stats = {
      maxHp: BASE_STATS.maxHp + (mods.maxHp || 0),
      hp: BASE_STATS.hp + (mods.maxHp || 0),
      maxChakra: BASE_STATS.maxChakra + (mods.maxChakra || 0),
      chakra: BASE_STATS.chakra + (mods.maxChakra || 0),
      ninjutsu: BASE_STATS.ninjutsu + (mods.ninjutsu || 0),
      taijutsu: BASE_STATS.taijutsu + (mods.taijutsu || 0),
      genjutsu: BASE_STATS.genjutsu + (mods.genjutsu || 0),
      velocidade: BASE_STATS.velocidade + (mods.velocidade || 0),
      resistencia: BASE_STATS.resistencia + (mods.resistencia || 0),
      inteligencia: BASE_STATS.inteligencia + (mods.inteligencia || 0),
    };

    const jutsus = [...BASE_JUTSUS, ...STARTER_JUTSUS[element], clanData.starterJutsu];

    let imageUrl: string | null = null;
    if (appearance && appearance.trim().length > 10) {
      const prompt =
        `anime style portrait of an original ninja RPG character ` +
        `(not Naruto, not any existing anime character), ` +
        `from ${village}, element ${element}, clan ${clanData.name}, ` +
        `${appearance}, highly detailed, vibrant colors`;
      imageUrl = await generateImage(prompt);
    }

    const character = await prisma.character.create({
      data: {
        userId,
        name,
        clan: clanData.id,
        village,
        element,
        ...stats,
        imageUrl,
        jutsus: JSON.stringify(jutsus),
        inventory: {
          create: STARTER_ITEMS,
        },
      },
      include: { inventory: true },
    });

    res.status(201).json({ character });
  } catch (err) {
    console.error('Create character error:', err);
    res.status(500).json({ error: 'Erro ao criar personagem' });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const characters = await prisma.character.findMany({
      where: { userId: req.userId! },
      include: { inventory: true, sessions: { where: { isActive: true }, take: 1 } },
    });
    res.json({ characters });
  } catch (err) {
    console.error('List characters error:', err);
    res.status(500).json({ error: 'Erro ao listar personagens' });
  }
});

router.get('/options/creation', (_req, res: Response) => {
  const clans = CLANS.map((c) => ({
    id: c.id,
    name: c.name,
    village: c.village,
    description: c.description,
    modifiers: c.modifiers,
    passive: c.passive,
    starterJutsu: c.starterJutsu,
    lore: c.lore,
  }));

  res.json({
    villages: VILLAGES,
    elements: ELEMENTS,
    clans,
    clansByVillage: getClansGroupedByVillage(),
  });
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const character = await prisma.character.findFirst({
      where: { id, userId: req.userId! },
      include: { inventory: true, missions: true },
    });
    if (!character) {
      res.status(404).json({ error: 'Personagem não encontrado' });
      return;
    }
    res.json({ character });
  } catch (err) {
    console.error('Get character error:', err);
    res.status(500).json({ error: 'Erro ao buscar personagem' });
  }
});

router.post('/:id/reimagine-avatar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { context } = (req.body || {}) as { context?: string };
    const character = await prisma.character.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!character) {
      res.status(404).json({ error: 'Personagem não encontrado' });
      return;
    }

    // Prompt base com dados do personagem + contexto opcional do usuário.
    const extra = context && context.trim().length > 0 ? `, ${context.trim()}` : '';
    const prompt =
      `anime style portrait of an original ninja RPG character ` +
      `(not Naruto, not any existing anime character), ` +
      `from ${character.village}, element ${character.element}, clan ${character.clan}` +
      `${extra}, highly detailed, vibrant colors`;

    console.log('[Reimagine avatar prompt]', prompt);

    const imageUrl = await generateImage(prompt);

    const updated = await prisma.character.update({
      where: { id: character.id },
      data: { imageUrl },
    });

    res.json({ character: updated });
  } catch (err) {
    console.error('Reimagine avatar error:', err);
    res.status(500).json({ error: 'Erro ao reimaginar avatar' });
  }
});

router.post('/:id/spend-attr', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { attribute } = req.body as { attribute?: string };

    if (!attribute) {
      res.status(400).json({ error: 'Atributo é obrigatório' });
      return;
    }

    const validAttrs = ['ninjutsu', 'taijutsu', 'genjutsu', 'velocidade', 'resistencia', 'inteligencia'] as const;
    if (!validAttrs.includes(attribute as any)) {
      res.status(400).json({ error: 'Atributo inválido' });
      return;
    }

    const character = await prisma.character.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!character) {
      res.status(404).json({ error: 'Personagem não encontrado' });
      return;
    }

    const currentVal = (character as any)[attribute] as number;
    const points = character.attrPoints ?? 0;

    // Custo progressivo: 1 ponto até 10, 2 pontos de 11–15, 3 pontos 16+.
    let cost = 1;
    if (currentVal >= 15) cost = 3;
    else if (currentVal >= 11) cost = 2;

    if (points < cost) {
      res.status(400).json({ error: 'Pontos de atributo insuficientes' });
      return;
    }

    const updated = await prisma.character.update({
      where: { id: character.id },
      data: {
        attrPoints: points - cost,
        [attribute]: currentVal + 1,
      },
    });

    res.json({ character: updated });
  } catch (err) {
    console.error('Spend attr error:', err);
    res.status(500).json({ error: 'Erro ao distribuir pontos de atributo' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const character = await prisma.character.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!character) {
      res.status(404).json({ error: 'Personagem não encontrado' });
      return;
    }

    await prisma.$transaction([
      prisma.messageHistory.deleteMany({
        where: { session: { characterId: id } },
      }),
      prisma.gameSession.deleteMany({
        where: { characterId: id },
      }),
      prisma.inventoryItem.deleteMany({
        where: { characterId: id },
      }),
      prisma.mission.deleteMany({
        where: { characterId: id },
      }),
      prisma.character.delete({
        where: { id },
      }),
    ]);

    res.status(204).send();
  } catch (err) {
    console.error('Delete character error:', err);
    res.status(500).json({ error: 'Erro ao excluir personagem' });
  }
});

export { router as characterRoutes };
