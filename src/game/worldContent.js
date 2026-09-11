export const RIVER = { z0: 22, z1: 24, x0: -36, x1: 36 };

export const BRIDGE = {
  span: [22, 23, 24],
  mouth: [-1, 0, 1],
  plankCost: { madeira: 5, pedra: 3, blocos: 2 },
  gateSouthZ: 21,
  gateNorthZ: 25,
};

export const MATERIALS = [
  { id: 'madeira', name: 'Madeira', icon: '🪵', c: '#6B4226' },
  { id: 'pedra', name: 'Pedra', icon: '🪨', c: '#9A9A9A' },
  { id: 'blocos', name: 'Blocos', icon: '🧱', c: '#B3512A' },
];

export const START_MATERIALS = { madeira: 5, pedra: 3, blocos: 2 };

export const CHALLENGE_REWARD_MATERIALS = { madeira: 2, pedra: 1, blocos: 1 };

export const QUESTIONS = [
  { cat: 'fracoes', q: 'Quanto é 1/2 + 1/4?', opts: ['2/6', '3/4', '1/8', '2/4'], a: 1 },
  { cat: 'fracoes', q: 'Qual fração equivale a 0,5?', opts: ['1/3', '5/2', '1/2', '2/5'], a: 2 },
  { cat: 'fracoes', q: 'Simplifique 8/12:', opts: ['4/6', '2/3', '3/4', '1/2'], a: 1 },
  { cat: 'fracoes', q: 'Quem é maior: 3/5 ou 7/10?', opts: ['3/5', '7/10', 'Iguais', 'Não dá pra comparar'], a: 1 },
  { cat: 'porcentagem', q: 'Quanto é 50% de 200?', opts: ['50', '150', '100', '25'], a: 2 },
  { cat: 'porcentagem', q: 'Um desconto de 10% em R$80 fica:', opts: ['R$72', 'R$70', 'R$8', 'R$71'], a: 0 },
  { cat: 'porcentagem', q: '25% é o mesmo que:', opts: ['1/2', '1/4', '1/5', '1/3'], a: 1 },
  { cat: 'porcentagem', q: '15% de 300:', opts: ['45', '30', '15', '60'], a: 0 },
  { cat: 'geometria', q: 'Quantos lados tem um hexágono?', opts: ['5', '8', '6', '7'], a: 2 },
  { cat: 'geometria', q: 'A soma dos ângulos internos de um triângulo é:', opts: ['180°', '90°', '360°', '270°'], a: 0 },
  { cat: 'geometria', q: 'Área de um quadrado de lado 4:', opts: ['8', '12', '16', '20'], a: 2 },
  { cat: 'geometria', q: 'Quantos vértices tem um cubo?', opts: ['6', '8', '10', '12'], a: 1 },
  { cat: 'final', q: 'Se 3x = 27, quanto vale x?', opts: ['7', '9', '8', '6'], a: 1 },
  { cat: 'final', q: 'Quanto é 12 × 8?', opts: ['96', '84', '108', '90'], a: 0 },
  { cat: 'final', q: 'Uma pizza tem 8 fatias. Você come 3. Que fração sobrou?', opts: ['3/8', '5/8', '5/3', '2/8'], a: 1 },
];

export const SUBJECT_QUESTIONS = {
  portugues: [
    { q: 'Qual frase está no plural?', opts: ['O menino corre.', 'Os meninos correm.', 'A menina corre.', 'O menino corre rápido.'], a: 1 },
    { q: 'Sinônimo de "feliz"?', opts: ['Triste', 'Radiante', 'Raivoso', 'Cansado'], a: 1 },
    { q: 'Qual palavra é um substantivo?', opts: ['Correr', 'Bonito', 'Livro', 'Rapidamente'], a: 2 },
    { q: 'O que é um parágrafo?', opts: ['Um ponto final', 'Uma ideia com começo, meio e fim', 'Uma pergunta', 'Um título'], a: 1 },
  ],
  ciencias: [
    { q: 'Qual gás as plantas absorvem na fotossíntese?', opts: ['Oxigênio', 'Nitrogênio', 'Gás carbônico', 'Hélio'], a: 2 },
    { q: 'Qual órgão bombeia o sangue?', opts: ['Pulmão', 'Coração', 'Fígado', 'Estômago'], a: 1 },
    { q: 'A água ferve a quantos graus ao nível do mar?', opts: ['100°C', '50°C', '90°C', '120°C'], a: 0 },
    { q: 'Qual destes é um ser vivo?', opts: ['Pedra', 'Água', 'Cogumelo', 'Ar'], a: 2 },
  ],
  historia: [
    { q: 'Quem proclamou a independência do Brasil?', opts: ['Dom Pedro I', 'Tiradentes', 'Marechal Deodoro', 'Dom Pedro II'], a: 0 },
    { q: 'Em que ano o Brasil foi "descoberto" pelos portugueses?', opts: ['1500', '1822', '1889', '1808'], a: 0 },
    { q: 'Qual povo construiu as pirâmides do Egito?', opts: ['Romanos', 'Gregos', 'Egípcios', 'Astecas'], a: 2 },
    { q: 'O que é uma linha do tempo?', opts: ['Um mapa de cidades', 'Uma organização de eventos em ordem cronológica', 'Uma tabela de preços', 'Um relógio de sol'], a: 1 },
  ],
  geografia: [
    { q: 'Qual é o maior oceano do planeta?', opts: ['Atlântico', 'Índico', 'Pacífico', 'Ártico'], a: 2 },
    { q: 'Quantos continentes existem?', opts: ['5', '6', '7', '8'], a: 2 },
    { q: 'Qual instrumento indica os pontos cardeais?', opts: ['Termômetro', 'Bússola', 'Barômetro', 'Telescópio'], a: 1 },
    { q: 'Qual é a capital do Brasil?', opts: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], a: 2 },
  ],
  arte: [
    { q: 'Quais são as cores primárias?', opts: ['Verde, laranja e roxo', 'Vermelho, azul e amarelo', 'Preto, branco e cinza', 'Rosa, turquesa e lilás'], a: 1 },
    { q: 'Leonardo da Vinci pintou:', opts: ['O Grito', 'Mona Lisa', 'Noite Estrelada', 'Abaporu'], a: 1 },
    { q: 'O que é uma escultura?', opts: ['Uma pintura em papel', 'Uma obra de arte em três dimensões', 'Um desenho a lápis', 'Uma fotografia'], a: 1 },
    { q: 'Ritmo, melodia e harmonia são elementos de:', opts: ['Pintura', 'Escultura', 'Música', 'Dança'], a: 2 },
  ],
  educacao_fisica: [
    { q: 'Qual esporte se joga com 5 jogadores por time na quadra?', opts: ['Futebol', 'Basquete', 'Vôlei', 'Tênis'], a: 1 },
    { q: 'O aquecimento antes do exercício serve para:', opts: ['Cansar mais rápido', 'Preparar o corpo e evitar lesões', 'Aumentar o peso', 'Diminuir a respiração'], a: 1 },
    { q: 'Qual habilidade é usada em quase todos os esportes?', opts: ['Coordenação motora', 'Cantar', 'Desenhar', 'Memorizar poemas'], a: 0 },
    { q: 'Uma atividade aeróbica é:', opts: ['Corrida', 'Levantamento de peso máximo', 'Alongamento parado', 'Dormir'], a: 0 },
  ],
  ingles: [
    { q: 'Como se diz "obrigado" em inglês?', opts: ['Please', 'Thank you', 'Sorry', 'Hello'], a: 1 },
    { q: 'Qual é a tradução de "cat"?', opts: ['Cachorro', 'Pássaro', 'Gato', 'Peixe'], a: 2 },
    { q: 'Complete: "I ___ a student."', opts: ['is', 'are', 'am', 'be'], a: 2 },
    { q: 'Qual dia da semana é "Friday"?', opts: ['Segunda', 'Quarta', 'Sexta', 'Domingo'], a: 2 },
  ],
  ensino_religioso: [
    { q: 'Qual valor é comum às grandes tradições religiosas?', opts: ['Ódio', 'Respeito e solidariedade', 'Indiferença', 'Egoísmo'], a: 1 },
    { q: 'O que é empatia?', opts: ['Fingir sentimentos', 'Colocar-se no lugar do outro', 'Não ouvir ninguém', 'Gritar mais alto'], a: 1 },
    { q: 'Quem é reverenciado como mestre em várias religiões?', opts: ['Uma montanha', 'Pessoas que ensinam o bem', 'Um animal', 'Uma tempestade'], a: 1 },
    { q: 'A liberdade religiosa garante:', opts: ['Obrigar todos a crer igual', 'Cada um seguir suas crenças com respeito', 'Proibir orações', 'Criar conflitos'], a: 1 },
  ],
  matematica_2: [
    { q: 'Se uma dúzia custa R$12, quanto custa uma unidade?', opts: ['R$2', 'R$1', 'R$0,50', 'R$12'], a: 1 },
    { q: 'Quantos minutos há em 2 horas?', opts: ['60', '90', '120', '150'], a: 2 },
    { q: 'O número 7 é:', opts: ['Primo', 'Par', 'Composto', 'Divisível por 2'], a: 0 },
    { q: 'Quanto é 100 ÷ 4?', opts: ['20', '25', '50', '40'], a: 1 },
  ],
};

export const SUBJECT_STATIONS = [
  { id: 'portugues', label: 'Estação de Português', emoji: '📖', cat: 'portugues', subject: 'Língua Portuguesa', color: '#0ea5e9', p: [-18, 3] },
  { id: 'ciencias', label: 'Estação de Ciências', emoji: '🔬', cat: 'ciencias', subject: 'Ciências', color: '#10b981', p: [18, 3] },
  { id: 'historia', label: 'Estação de História', emoji: '🏛️', cat: 'historia', subject: 'História', color: '#f59e0b', p: [-18, 14] },
  { id: 'geografia', label: 'Estação de Geografia', emoji: '🌍', cat: 'geografia', subject: 'Geografia', color: '#ef4444', p: [18, 14] },
  { id: 'arte', label: 'Estação de Arte', emoji: '🎨', cat: 'arte', subject: 'Arte', color: '#ec4899', p: [-26, -12] },
  { id: 'educacao_fisica', label: 'Estação de Educação Física', emoji: '⚽', cat: 'educacao_fisica', subject: 'Educação Física', color: '#22c55e', p: [26, 9] },
  { id: 'ingles', label: 'Estação de Inglês', emoji: '🇬🇧', cat: 'ingles', subject: 'Língua Inglesa', color: '#6366f1', p: [6, -20] },
  { id: 'ensino_religioso', label: 'Estação de Ensino Religioso', emoji: '🕊️', cat: 'ensino_religioso', subject: 'Ensino Religioso', color: '#a855f7', p: [-6, 17] },
  { id: 'matematica', label: 'Estação de Matemática', emoji: '🧮', cat: 'final', subject: 'Matemática', color: '#7c3aed', p: [-29, 16] },
];

export const ARENA_ROUNDS = [
  { name: 'Frações', cat: 'fracoes', n: 3 },
  { name: 'Porcentagem', cat: 'porcentagem', n: 3 },
  { name: 'Geometria', cat: 'geometria', n: 3 },
  { name: 'Desafio Mestre', cat: 'final', n: 3 },
];

export const CITY = {
  pavement: { z0: 26, z1: 35, x0: -14, x1: 14 },
  entranceZ: 25.2,
};

export const ARENA = {
  x0: -23, x1: -18, z0: -14, z1: -10,
  enter: { x: -20.5, z: -10 },
  npc: { x: -20.5, z: -11.6, c: '#F39C12', label: 'Árbitro da Arena' },
};

export const FARM_ZONE = {
  x0: -12, x1: 12, z0: -8, z1: 4,
  slots: [
    { id: 'slot_1', p: [-10, -8], rot: 0 },
    { id: 'slot_2', p: [10, -6], rot: 0 },
    { id: 'slot_3', p: [-10, -2], rot: 0 },
    { id: 'slot_4', p: [10, 2], rot: 0 },
  ],
};

export const BUILDING_3D = {
  celeiro: { w: 5, d: 4, h: 3, wall: '#A0522D', roof: '#7C3AED', door: '#6B4226' },
  estufa: { w: 4, d: 4, h: 3, wall: '#BFE8FF', roof: '#E8F6FF', door: '#9BD8F5', glass: true },
  moinho: { w: 3, d: 3, h: 5, wall: '#E0D5C5', roof: '#8E5B2F', door: '#6B4226' },
  granja: { w: 4, d: 3, h: 2, wall: '#D9B36A', roof: '#C94F1D', door: '#6B4226' },
  cocheira: { w: 5, d: 4, h: 3, wall: '#8B4513', roof: '#F5F5F5', door: '#6B4226' },
};

export const ANIMAL_DEFS = {
  vaca: { name: 'Vaca', emoji: '🐄', color: '#F5F5F5', spot: '#2B2B2B', w: 0.9, h: 0.7 },
  galinha: { name: 'Galinha', emoji: '🐔', color: '#FFFFFF', spot: '#E74C3C', w: 0.5, h: 0.5 },
  ovelha: { name: 'Ovelha', emoji: '🐑', color: '#F0EDE6', spot: '#9A9A9A', w: 0.8, h: 0.65 },
  porco: { name: 'Porco', emoji: '🐷', color: '#F5A3B8', spot: '#E07B9A', w: 0.75, h: 0.6 },
  cavalo: { name: 'Cavalo', emoji: '🐴', color: '#8B5A2B', spot: '#5C3D22', w: 1.1, h: 1.0 },
};

export const WILDLIFE_DEFS = {
  passaro: { name: 'Pássaro', emoji: '🐦', color: '#4FC3F7', w: 0.35 },
  coelho: { name: 'Coelho', emoji: '🐰', color: '#E8D5C2', w: 0.5 },
  esquilo: { name: 'Esquilo', emoji: '🐿️', color: '#C89B6E', w: 0.45 },
  borboleta: { name: 'Borboleta', emoji: '🦋', color: '#EC4899', w: 0.3 },
};

export const SHOP_SPOT = { x: 14, z: 6 };

export const LANDMARKS = [
  { label: 'Escola do Conhecimento', p: [0, -13], y: 6.8, c: '#5DADE2' },
  { label: 'Fazenda Matemática', p: [-12, 10], y: 5.5, c: '#27AE60' },
  { label: 'Praça Central', p: [0, -3], y: 4, c: '#F39C12' },
  { label: 'Biblioteca das Fórmulas', p: [0.5, 30], y: 8.6, c: '#8B4513' },
  { label: 'Estações do Saber', p: [0, 3], y: 4, c: '#7C3AED' },
];

export const NPC_DIALOGS = {
  IARA: 'Ariston, temos um problema. A ponte para a Cidade da Matemática está quebrada! Responda Desafios Matemáticos para ganhar materiais e reconstruí-la. Vamos lá?',
  Professor: 'A matemática é a ponte entre o problema e a solução. Ganhe materiais respondendo questões!',
  Agricultor: 'Plante, colha e troque pela economia da fazenda. Os recursos da ponte também vêm dos estudos!',
  Mercador: 'Encontre moedas pelo mundo e troque na loja. Boa exploração!',
  CityTeacher: 'Bem-vindo(a) à Cidade da Matemática! Aqui cada resposta abre novos caminhos.',
  ArenaReferee: 'A Arena do Conhecimento é um campeonato de raciocínio: Frações, Porcentagem, Geometria e um Desafio Mestre. Mostre seu poder!',
  Guardia: 'As Estações do Saber reúnem o conhecimento das 9 matérias da BNCC. Complete cada uma e brilhe!',
  Jardineira: 'Olha que mundo cheio de vida! Comprou animais na fazenda? Eles também aparecem aqui no mundo 3D. 🐄',
  Cartografo: 'Explore todos os cantos do mapa. Cada ponto de exploração vale ouro… literalmente! 💰',
  Musicista: 'A música é matemática em forma de som. Estude e sinta o ritmo! 🎵',
  Guia: 'Use as teclas WASD para andar, E para interagir e M para ver o mapa. O botão de ajuda ❓ mostra tudo!',
};

export const TUTORIAL_STEPS = [
  { title: 'Bem-vindo ao Mundo IARA!', body: 'Explore a Fazenda do Conhecimento em 3D. Este é o seu mundo de estudos e diversão.', icon: '🌍' },
  { title: 'Como andar', body: 'Use WASD (ou as setas) para andar, SHIFT para correr e ESPAÇO para pular. Arraste o mouse para girar a câmera.', icon: '🎮' },
  { title: 'Interaja com o mundo', body: 'Aproxime-se de personagens e estações e pressione E para conversar, aceitar desafios e comprar.', icon: '✋' },
  { title: 'Complete as Estações do Saber', body: 'São 9 estações, uma para cada matéria da BNCC. Ganhe Pontos de Exploração e a medalha Enciclopédico!', icon: '🧠' },
  { title: 'Sua fazenda no mundo', body: 'Animais e celeiros comprados na Fazendinha 2D aparecem aqui! Distribua sua vida pelo mundo.', icon: '🐄' },
  { title: 'Dica: o mapa', body: 'Pressione M para abrir o mapa. E o botão ❓ no topo traz este guia sempre que precisar.', icon: '🗺️' },
];

export const EXPLORATION_REDEEM_ITEMS = [
  { id: 'madeira_10', type: 'material', icon: '🪵', name: '+10 Madeira', points: 8, material: 'madeira', qty: 10 },
  { id: 'pedra_10', type: 'material', icon: '🪨', name: '+10 Pedra', points: 8, material: 'pedra', qty: 10 },
  { id: 'blocos_10', type: 'material', icon: '🧱', name: '+10 Blocos', points: 8, material: 'blocos', qty: 10 },
  { id: 'sementes_milho', type: 'seed', icon: '🌽', name: '10 Sementes de Milho', points: 12, seed: 'milho', qty: 10 },
  { id: 'sementes_cafe', type: 'seed', icon: '☕', name: '5 Sementes de Café', points: 15, seed: 'cafe', qty: 5 },
  { id: 'fogos', type: 'decor', icon: '🎆', name: 'Fogos de Artifício', points: 20, decor: 'fireworks' },
  { id: 'coroa', type: 'decor', icon: '👑', name: 'Coroa do Saber', points: 40, decor: 'crown' },
];