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

export const NPC_DIALOGS = {
  IARA: 'Ariston, temos um problema. A ponte para a Cidade da Matemática está quebrada! Responda Desafios Matemáticos para ganhar materiais e reconstruí-la. Vamos lá?',
  Professor: 'A matemática é a ponte entre o problema e a solução. Ganhe materiais respondendo questões!',
  Agricultor: 'Plante, colha e troque pela economia da fazenda. Os recursos da ponte também vêm dos estudos!',
  Mercador: 'Encontre moedas pelo mundo e troque na loja. Boa exploração!',
  CityTeacher: 'Bem-vindo(a) à Cidade da Matemática! Aqui cada resposta abre novos caminhos.',
  ArenaReferee: 'A Arena do Conhecimento é um campeonato de raciocínio: Frações, Porcentagem, Geometria e um Desafio Mestre. Mostre seu poder!',
};