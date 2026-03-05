export interface ClanModifiers {
  ninjutsu?: number;
  taijutsu?: number;
  genjutsu?: number;
  velocidade?: number;
  resistencia?: number;
  inteligencia?: number;
  maxHp?: number;
  maxChakra?: number;
}

export interface ClanData {
  id: string;
  name: string;
  village: string;
  description: string;
  modifiers: ClanModifiers;
  passive: {
    name: string;
    description: string;
  };
  starterJutsu: string;
  lore: string;
}

export const CLANS: ClanData[] = [
  // ===== KONOHA =====
  {
    id: 'uchiha',
    name: 'Uchiha',
    village: 'Konoha',
    description: 'Mestres do Sharingan, especialistas em Genjutsu e Ninjutsu de fogo.',
    modifiers: { genjutsu: 3, ninjutsu: 2, resistencia: -1 },
    passive: {
      name: 'Sharingan',
      description: 'Olhos que copiam jutsus e percebem movimentos antes que aconteçam. Bônus em percepção e contra-genjutsu.',
    },
    starterJutsu: 'Katon: Hosenka no Jutsu',
    lore: '"Aqueles que possuem o Sharingan carregam a maldição do ódio... e um poder sem igual."',
  },
  {
    id: 'hyuuga',
    name: 'Hyuuga',
    village: 'Konoha',
    description: 'Portadores do Byakugan, mestres do combate corpo a corpo com o Juuken.',
    modifiers: { taijutsu: 3, velocidade: 2, ninjutsu: -1 },
    passive: {
      name: 'Byakugan',
      description: 'Visão de 360 graus que enxerga o sistema de chakra do oponente. Permite fechar tenketsu (pontos de chakra).',
    },
    starterJutsu: 'Juuken: Hakke Kuushou',
    lore: '"O Byakugan tudo vê. Nenhum ponto cego, nenhum segredo escondido."',
  },
  {
    id: 'nara',
    name: 'Nara',
    village: 'Konoha',
    description: 'Estrategistas brilhantes que manipulam sombras para controlar inimigos.',
    modifiers: { inteligencia: 3, genjutsu: 2, taijutsu: -1 },
    passive: {
      name: 'QI Genial',
      description: 'Inteligência acima de 200 de QI. Bônus em planejamento tático, armadilhas e leitura de situações de combate.',
    },
    starterJutsu: 'Kagemane no Jutsu',
    lore: '"Que problemático... mas já calculei 200 movimentos à frente."',
  },
  {
    id: 'senju',
    name: 'Senju',
    village: 'Konoha',
    description: 'Linhagem dos fundadores de Konoha, conhecidos por vitalidade excepcional.',
    modifiers: { resistencia: 2, ninjutsu: 2, maxHp: 10, maxChakra: 10 },
    passive: {
      name: 'Vitalidade Ancestral',
      description: 'Recuperação natural aprimorada. O corpo se regenera mais rápido e resiste melhor a venenos e doenças.',
    },
    starterJutsu: 'Mokuton: Mokujoheki',
    lore: '"O sangue dos Senju carrega a Vontade do Fogo em cada célula."',
  },

  // ===== SUNA =====
  {
    id: 'sabaku',
    name: 'Sabaku',
    village: 'Suna',
    description: 'Senhores da areia, capazes de controlá-la como extensão do próprio corpo.',
    modifiers: { ninjutsu: 3, resistencia: 2, velocidade: -1 },
    passive: {
      name: 'Escudo de Areia',
      description: 'A areia se move automaticamente para proteger o usuário de ataques, formando uma defesa parcial mesmo sem concentração.',
    },
    starterJutsu: 'Sabaku Kyuu',
    lore: '"A areia é minha armadura, minha arma e minha sentença para os inimigos."',
  },
  {
    id: 'chikamatsu',
    name: 'Chikamatsu',
    village: 'Suna',
    description: 'Mestres marionetistas que controlam marionetes de combate com fios de chakra.',
    modifiers: { inteligencia: 3, ninjutsu: 2, taijutsu: -1 },
    passive: {
      name: 'Fios de Chakra',
      description: 'Controle preciso de fios de chakra invisíveis. Permite manipular objetos, armas e marionetes à distância.',
    },
    starterJutsu: 'Kugutsu no Jutsu',
    lore: '"Por que arriscar seu corpo quando uma marionete pode lutar por você?"',
  },
  {
    id: 'hoki',
    name: 'Hōki',
    village: 'Suna',
    description: 'Especialistas em venenos e toxinas extraídas das criaturas do deserto.',
    modifiers: { inteligencia: 3, velocidade: 2, resistencia: -1 },
    passive: {
      name: 'Resistência a Venenos',
      description: 'Imunidade natural a venenos fracos e resistência elevada a toxinas potentes. Conhecimento profundo de antídotos.',
    },
    starterJutsu: 'Dokugiri',
    lore: '"O deserto ensina: o veneno mais letal é o que não se sente."',
  },
  {
    id: 'sunaarashi',
    name: 'Sunaarashi',
    village: 'Suna',
    description: 'Guerreiros nômades do deserto, velozes como tempestades de areia.',
    modifiers: { velocidade: 3, taijutsu: 2, genjutsu: -1 },
    passive: {
      name: 'Miragem do Deserto',
      description: 'Movimentos que criam ilusões naturais de calor. Bônus de evasão em ambientes quentes e áridos.',
    },
    starterJutsu: 'Suna Shuriken',
    lore: '"Quando a tempestade de areia passa, só restam os Sunaarashi de pé."',
  },

  // ===== KIRI =====
  {
    id: 'hozuki',
    name: 'Hōzuki',
    village: 'Kiri',
    description: 'Capazes de transformar o corpo em água, tornando-se quase imunes a dano físico.',
    modifiers: { ninjutsu: 3, velocidade: 2, resistencia: -1 },
    passive: {
      name: 'Suika no Jutsu',
      description: 'O corpo pode se liquefazer parcialmente, reduzindo dano de ataques físicos e permitindo escapar de imobilizações.',
    },
    starterJutsu: 'Suiton: Teppoudama',
    lore: '"Tente me acertar. Meu corpo é a própria água."',
  },
  {
    id: 'yuki',
    name: 'Yuki',
    village: 'Kiri',
    description: 'Portadores do Hyōton, o Kekkei Genkai que combina vento e água em gelo mortal.',
    modifiers: { ninjutsu: 3, genjutsu: 2, taijutsu: -1 },
    passive: {
      name: 'Hyōton',
      description: 'Kekkei Genkai que permite criar e manipular gelo. Técnicas combinam beleza letal com poder destrutivo.',
    },
    starterJutsu: 'Hyoton: Sensatsu Suishou',
    lore: '"O gelo não é frio — é a ausência de piedade cristalizada."',
  },
  {
    id: 'kaguya',
    name: 'Kaguya',
    village: 'Kiri',
    description: 'Guerreiros ferozes que manipulam seus próprios ossos como armas indestrutíveis.',
    modifiers: { taijutsu: 3, resistencia: 3, genjutsu: -2 },
    passive: {
      name: 'Shikotsumyaku',
      description: 'Kekkei Genkai que permite extrair, moldar e endurecer ossos do próprio corpo como armas e armaduras.',
    },
    starterJutsu: 'Teshi Sendan',
    lore: '"Meus ossos são mais duros que aço. Minha dança é a última que verá."',
  },
  {
    id: 'terumi',
    name: 'Terumī',
    village: 'Kiri',
    description: 'Linhagem dual capaz de usar vapor corrosivo e lava derretida.',
    modifiers: { ninjutsu: 3, resistencia: 2, velocidade: -1 },
    passive: {
      name: 'Futton/Yōton',
      description: 'Dois Kekkei Genkai: Futton (vapor ácido que derrete qualquer coisa) e Yōton (lava que incinera o campo de batalha).',
    },
    starterJutsu: 'Futton: Koumu no Jutsu',
    lore: '"Vapor ou lava? Escolha como quer ser destruído."',
  },

  // ===== KUMO =====
  {
    id: 'yotsuki',
    name: 'Yotsuki',
    village: 'Kumo',
    description: 'Tanques blindados por relâmpagos, combinam força bruta com eletricidade.',
    modifiers: { taijutsu: 3, resistencia: 2, maxHp: 10, genjutsu: -2 },
    passive: {
      name: 'Raiton no Yoroi',
      description: 'Armadura de relâmpago que envolve o corpo, amplificando a força dos golpes e causando dano elétrico ao contato.',
    },
    starterJutsu: 'Lariat',
    lore: '"Quando o trovão cai, só os Yotsuki ficam de pé."',
  },
  {
    id: 'raijin',
    name: 'Raijin',
    village: 'Kumo',
    description: 'Mestres da tempestade que combinam água e raio em ataques devastadores.',
    modifiers: { ninjutsu: 3, velocidade: 2, resistencia: -1 },
    passive: {
      name: 'Ranton',
      description: 'Kekkei Genkai que funde Suiton e Raiton, criando feixes de energia e tempestades controladas.',
    },
    starterJutsu: 'Ranton: Reiza Sakasu',
    lore: '"A tempestade não pergunta. Ela simplesmente destrói."',
  },
  {
    id: 'hagoromo',
    name: 'Hagoromo',
    village: 'Kumo',
    description: 'Ilusionistas das nuvens, especialistas em genjutsu e manipulação mental.',
    modifiers: { genjutsu: 3, inteligencia: 2, taijutsu: -1 },
    passive: {
      name: 'Névoa Mental',
      description: 'Genjutsus que causam confusão duradoura. O alvo continua desorientado mesmo após quebrar a ilusão inicial.',
    },
    starterJutsu: 'Kumogakure no Jutsu',
    lore: '"Você já está na minha ilusão. Desde quando? Boa pergunta."',
  },
  {
    id: 'motoi',
    name: 'Motoi',
    village: 'Kumo',
    description: 'Mestres seladores de Kumo, especialistas em fuinjutsu ofensivo e defensivo.',
    modifiers: { ninjutsu: 2, inteligencia: 2, genjutsu: 2, taijutsu: -2 },
    passive: {
      name: 'Fuinjutsu Avançado',
      description: 'Domínio de selos de contenção, barreira e aprisionamento. Pode selar chakra, movimento e até jutsus inimigos.',
    },
    starterJutsu: 'Fuuin: Raiko Hokori',
    lore: '"Um selo bem feito vale mais que mil jutsus."',
  },

  // ===== IWA =====
  {
    id: 'kamizuru',
    name: 'Kamizuru',
    village: 'Iwa',
    description: 'Controladores de insetos que usam abelhas como armas e sensores.',
    modifiers: { ninjutsu: 3, inteligencia: 2, velocidade: -1 },
    passive: {
      name: 'Enxame',
      description: 'Abelhas ninjas servem como sensores de longo alcance, arma de ataque e escudo vivo. O enxame é uma extensão do usuário.',
    },
    starterJutsu: 'Hachi Senbon',
    lore: '"Mil ferrões. Mil olhos. Um só clã."',
  },
  {
    id: 'bakuha',
    name: 'Bakuha',
    village: 'Iwa',
    description: 'Artistas da explosão com o Kekkei Genkai Bakuton — tudo que tocam pode detonar.',
    modifiers: { ninjutsu: 3, velocidade: 2, resistencia: -1 },
    passive: {
      name: 'Bakuton',
      description: 'Kekkei Genkai explosivo. Infunde chakra em objetos para detoná-los. Quanto mais chakra, maior a explosão.',
    },
    starterJutsu: 'Bakuton: Jiraiken',
    lore: '"Arte é uma explosão! E eu sou o artista supremo."',
  },
  {
    id: 'gantetsu',
    name: 'Gantetsu',
    village: 'Iwa',
    description: 'Muralhas vivas que endurecem o corpo como rocha, tanques imparáveis.',
    modifiers: { resistencia: 3, taijutsu: 2, maxHp: 15, velocidade: -2 },
    passive: {
      name: 'Doton: Pele de Pedra',
      description: 'A pele endurece naturalmente como rocha. Reduz dano físico passivamente e permite golpes com peso de pedra.',
    },
    starterJutsu: 'Doton: Kengan no Jutsu',
    lore: '"Montanhas não se movem. Mas quando eu me movo, é como uma avalanche."',
  },
  {
    id: 'tsuchigumo',
    name: 'Tsuchigumo',
    village: 'Iwa',
    description: 'Estrategistas subterrâneos, mestres em emboscadas e armadilhas de terra.',
    modifiers: { inteligencia: 3, ninjutsu: 2, taijutsu: -1 },
    passive: {
      name: 'Armadilhas Subterrâneas',
      description: 'Bônus em preparação de emboscadas e combate em terreno preparado. Pode criar túneis e armadilhas de terra rapidamente.',
    },
    starterJutsu: 'Doton: Moguragakure no Jutsu',
    lore: '"A terra é meu território. Você está pisando na minha armadilha."',
  },
];

export function getClansByVillage(village: string): ClanData[] {
  return CLANS.filter((c) => c.village === village);
}

export function getClanById(id: string): ClanData | undefined {
  return CLANS.find((c) => c.id === id);
}

export function getClansGroupedByVillage(): Record<string, ClanData[]> {
  const grouped: Record<string, ClanData[]> = {};
  for (const clan of CLANS) {
    if (!grouped[clan.village]) grouped[clan.village] = [];
    grouped[clan.village].push(clan);
  }
  return grouped;
}
