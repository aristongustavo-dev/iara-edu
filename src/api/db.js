import { uid } from '@/lib/utils';
import { pullFromCloud, scheduleCloudSync } from './cloud';
import { DEMO_ACCOUNTS } from './demoAccounts';

const STORAGE_KEY = 'iara_edu_db_v2';

const now = () => new Date().toISOString();

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const buildSeed = () => {
  const admin = {
    id: 'usr_admin', role: 'direcao', name: 'Diretor Everaldo',
    email: 'diretor@escola.com', school_name: 'Escola Municipal Sonho Dourado',
    grade_level: '', xp: 0, level: 1, badges: [], total_activities: 0, total_correct: 0, streak_days: 0,
  };
  const teacher = {
    id: 'usr_teacher1', role: 'professor', name: 'Professora Marina',
    email: 'marina@escola.com', school_name: 'Escola Municipal Sonho Dourado',
    grade_level: '', subjects: ['matematica', 'ciencias'],
    xp: 0, level: 1, badges: [], total_activities: 0, total_correct: 0, streak_days: 0,
  };
  const teacher2 = {
    id: 'usr_teacher2', role: 'professor', name: 'Professor Carlos',
    email: 'carlos@escola.com', school_name: 'Escola Municipal Sonho Dourado',
    grade_level: '', subjects: ['lingua_portuguesa', 'historia'],
    xp: 0, level: 1, badges: [], total_activities: 0, total_correct: 0, streak_days: 0,
  };
  const student = {
    id: 'usr_stud1', role: 'aluno', name: 'Joãozinho', email: 'joao@escola.com',
    school_name: 'Escola Municipal Sonho Dourado', grade_level: '6_ano_fund', class_id: 'cls_6a',
    xp: 340, level: 6, badges: [
      { name: 'Primeiros Passos', icon: '🌟', earned_date: daysAgo(20) },
      { name: 'Mestre da Matemática', icon: '🧮', earned_date: daysAgo(9) },
      { name: 'Sequência de 3 dias', icon: '🔥', earned_date: daysAgo(3) },
    ],
    total_activities: 6, total_correct: 41, streak_days: 3,
  };
  const student2 = {
    id: 'usr_stud2', role: 'aluno', name: 'Ana Beatriz', email: 'ana@escola.com',
    school_name: 'Escola Municipal Sonho Dourado', grade_level: '6_ano_fund', class_id: 'cls_6a',
    xp: 210, level: 4, badges: [
      { name: 'Primeiros Passos', icon: '🌟', earned_date: daysAgo(15) },
      { name: 'Exploradora de Ciências', icon: '🔬', earned_date: daysAgo(6) },
    ],
    total_activities: 4, total_correct: 26, streak_days: 1,
  };
  const student3 = {
    id: 'usr_stud3', role: 'aluno', name: 'Pedro Lucas', email: 'pedro@escola.com',
    school_name: 'Escola Municipal Sonho Dourado', grade_level: '6_ano_fund', class_id: 'cls_6a',
    xp: 120, level: 2, badges: [{ name: 'Primeiros Passos', icon: '🌟', earned_date: daysAgo(12) }],
    total_activities: 3, total_correct: 14, streak_days: 0,
  };
  const parent = {
    id: 'usr_parent', role: 'pai', name: 'Sr. Roberto', email: 'roberto@familia.com',
    school_name: 'Escola Municipal Sonho Dourado', child_email: 'joao@escola.com',
    xp: 0, level: 1, badges: [], total_activities: 0, total_correct: 0, streak_days: 0,
  };

  const classes = [
    {
      id: 'cls_6a', name: '6º Ano A', grade_level: '6_ano_fund', subject: 'geral',
      teacher_email: 'marina@escola.com', school_name: 'Escola Municipal Sonho Dourado',
      year: 2026, color: '#7c3aed',
      student_emails: ['joao@escola.com', 'ana@escola.com', 'pedro@escola.com'],
    },
    {
      id: 'cls_7a', name: '7º Ano A', grade_level: '7_ano_fund', subject: 'geral',
      teacher_email: 'carlos@escola.com', school_name: 'Escola Municipal Sonho Dourado',
      year: 2026, color: '#0ea5e9', student_emails: [],
    },
  ];

  const activities = [
    {
      id: 'act_math1',
      title: 'Frações na Fazenda',
      description: 'Ajude a Iara a dividir as frutas da fazenda em partes iguais. Vamos aprender frações de um jeito divertido!',
      subject: 'matematica', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF06MA09', 'EF06MA03'], descriptor_code: 'EF06MA09',
      game_mode: 'quiz_fases', phase: 1, difficulty: 'facil', xp_reward: 20,
      medal: 'bronze', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'marina@escola.com', adapted_by_iara: false,
      questions: [
        {
          id: 'q1', type: 'multipla_escolha',
          statement: 'A fazenda tem 12 maçãs. A Iara quer dividir igualmente em 3 cestas. Quantas maçãs ficam em cada cesta?',
          options: [{ id: 'a', text: '4' }, { id: 'b', text: '3' }, { id: 'c', text: '6' }, { id: 'd', text: '12' }],
          correct_answer: 'a', explanation: '12 ÷ 3 = 4. Assim, cada cesta fica com 4 maçãs.',
          points: 10,
        },
        {
          id: 'q2', type: 'multipla_escolha',
          statement: 'Qual fração representa metade da pizza de milho da fazenda?',
          options: [{ id: 'a', text: '1/3' }, { id: 'b', text: '1/2' }, { id: 'c', text: '2/2' }, { id: 'd', text: '1/4' }],
          correct_answer: 'b', explanation: 'Metade é uma parte de duas partes iguais: 1/2.',
          points: 10,
        },
        {
          id: 'q3', type: 'verdadeiro_falso',
          statement: 'A fração 4/8 é equivalente à fração 1/2?',
          options: [{ id: 'verdadeiro', text: 'Verdadeiro' }, { id: 'falso', text: 'Falso' }],
          correct_answer: 'verdadeiro', explanation: '4/8 simplificada por 4 resulta em 1/2. São equivalentes.',
          points: 10,
        },
        {
          id: 'q4', type: 'numerica',
          statement: 'Calcule: 2/3 + 1/3 = ?',
          options: [{ id: 'a', text: '1' }, { id: 'b', text: '2/3' }, { id: 'c', text: '1/3' }, { id: 'd', text: '3/6' }],
          correct_answer: 'a', explanation: '2/3 + 1/3 = 3/3 = 1 inteiro.',
          points: 10,
        },
      ],
    },
    {
      id: 'act_math2',
      title: 'Desafio de Operações',
      description: 'Resolva operações com números naturais e ganhe moedas para sua fazenda.',
      subject: 'matematica', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF06MA03'], descriptor_code: 'EF06MA03',
      game_mode: 'desafio_misto', phase: 1, difficulty: 'medio', xp_reward: 30,
      medal: 'prata', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'marina@escola.com', adapted_by_iara: true,
      questions: [
        {
          id: 'q1', type: 'multipla_escolha',
          statement: 'A colheita rendeu 156 laranjas. O caminhão pode levar 12 por caixa. Quantas caixas serão necessárias?',
          options: [{ id: 'a', text: '11' }, { id: 'b', text: '13' }, { id: 'c', text: '14' }, { id: 'd', text: '12' }],
          correct_answer: 'b', explanation: '156 ÷ 12 = 13 caixas cheias.',
          points: 10,
        },
        {
          id: 'q2', type: 'multipla_escolha',
          statement: 'Joãozinho tinha 45 moedas, ganhou 37 e depois gastou 24. Com quantas ficou?',
          options: [{ id: 'a', text: '58' }, { id: 'b', text: '62' }, { id: 'c', text: '48' }, { id: 'd', text: '56' }],
          correct_answer: 'a', explanation: '45 + 37 = 82; 82 − 24 = 58 moedas.',
          points: 10,
        },
        {
          id: 'q3', type: 'numerica',
          statement: 'Calcule: 8 × 7 = ?',
          options: [{ id: 'a', text: '54' }, { id: 'b', text: '56' }, { id: 'c', text: '64' }, { id: 'd', text: '48' }],
          correct_answer: 'b', explanation: 'A tabuada do 8: 8 × 7 = 56.',
          points: 10,
        },
        {
          id: 'q4', type: 'verdadeiro_falso',
          statement: 'O quociente de 100 ÷ 4 é 25?',
          options: [{ id: 'verdadeiro', text: 'Verdadeiro' }, { id: 'falso', text: 'Falso' }],
          correct_answer: 'verdadeiro', explanation: '100 ÷ 4 = 25, correto.',
          points: 10,
        },
      ],
    },
    {
      id: 'act_port1',
      title: 'Aventura de Leitura',
      description: 'Vamos praticar interpretação de texto com uma história sobre a floresta amazônica e a Iara.',
      subject: 'lingua_portuguesa', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF06LP01', 'EF67LP03'], descriptor_code: 'EF67LP03',
      game_mode: 'missao_aventura', phase: 1, difficulty: 'facil', xp_reward: 25,
      medal: 'bronze', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'carlos@escola.com', adapted_by_iara: false,
      questions: [
        {
          id: 'q1', type: 'multipla_escolha',
          statement: 'No conto, a Iara usa o canto para encantar as pessoas. Qual é a lição principal da história?',
          options: [
            { id: 'a', text: 'A água deve ser respeitada' },
            { id: 'b', text: 'O canto é inútil' },
            { id: 'c', text: 'Os rios devem ser poluídos' },
            { id: 'd', text: 'As lendas não importam' },
          ],
          correct_answer: 'a', explanation: 'A lenda reforça o respeito e o cuidado com os rios e a natureza.',
          points: 10,
        },
        {
          id: 'q2', type: 'verdadeiro_falso',
          statement: 'A Iara é um personagem do folclore brasileiro ligado aos rios. Essa afirmação é verdadeira?',
          options: [{ id: 'verdadeiro', text: 'Verdadeiro' }, { id: 'falso', text: 'Falso' }],
          correct_answer: 'verdadeiro', explanation: 'Sim! A Iara (ou Mãe d’Água) é uma lenda do folclore brasileiro.',
          points: 10,
        },
        {
          id: 'q3', type: 'completar',
          statement: 'Complete: A Iara é conhecida como a senhora das __________.',
          options: [{ id: 'a', text: 'águas' }, { id: 'b', text: 'montanhas' }, { id: 'c', text: 'estrelas' }, { id: 'd', text: 'florestas secas' }],
          correct_answer: 'a', explanation: 'A Iara é a senhora das águas, protetora dos rios.',
          points: 10,
        },
      ],
    },
    {
      id: 'act_cie1',
      title: 'Ciências da Natureza',
      description: 'Explorando os ecossistemas e a importância da água para a vida.',
      subject: 'ciencias', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF06CI05', 'EF06CI01'], descriptor_code: 'EF06CI05',
      game_mode: 'quiz_fases', phase: 1, difficulty: 'medio', xp_reward: 25,
      medal: 'prata', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'marina@escola.com', adapted_by_iara: true,
      questions: [
        {
          id: 'q1', type: 'multipla_escolha',
          statement: 'Qual é o principal processo responsável pela purificação natural da água na natureza?',
          options: [{ id: 'a', text: 'Ciclo da água' }, { id: 'b', text: 'Fotossíntese' }, { id: 'c', text: 'Evaporação apenas' }, { id: 'd', text: 'Poluição' }],
          correct_answer: 'a', explanation: 'O ciclo da água envolve evaporação, condensação e precipitação.',
          points: 10,
        },
        {
          id: 'q2', type: 'verdadeiro_falso',
          statement: 'Toda a água do planeta Terra é potável. Essa afirmação é verdadeira?',
          options: [{ id: 'verdadeiro', text: 'Verdadeiro' }, { id: 'falso', text: 'Falso' }],
          correct_answer: 'falso', explanation: 'Menos de 3% da água do planeta é doce, e grande parte está congelada nas geleiras.',
          points: 10,
        },
        {
          id: 'q3', type: 'multipla_escolha',
          statement: 'Qual é a função principal das plantas no ecossistema aquático?',
          options: [{ id: 'a', text: 'Poluir a água' }, { id: 'b', text: 'Produzir oxigênio e alimento' }, { id: 'c', text: 'Secar os rios' }, { id: 'd', text: 'Atrair insetos' }],
          correct_answer: 'b', explanation: 'As plantas aquáticas produzem oxigênio através da fotossíntese e servem de alimento para peixes.',
          points: 10,
        },
        {
          id: 'q4', type: 'multipla_escolha',
          statement: 'Qual é a principal causa da poluição dos rios no Brasil?',
          options: [{ id: 'a', text: 'Chuvas naturais' }, { id: 'b', text: 'Despejo de esgoto e lixo' }, { id: 'c', text: 'Peixes grandes' }, { id: 'd', text: 'Rochas no fundo' }],
          correct_answer: 'b', explanation: 'O despejo de esgoto doméstico e lixo nos rios é a principal causa da poluição hídrica.',
          points: 10,
        },
      ],
    },
    {
      id: 'act_his1',
      title: 'Mistérios do Brasil Colônia',
      description: 'Um quiz em fases para desvendar os segredos do período colonial brasileiro com a Iara!',
      subject: 'historia', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF06HI08', 'EF06HI09'], descriptor_code: 'EF06HI08',
      game_mode: 'quiz_fases', phase: 1, difficulty: 'facil', xp_reward: 25,
      medal: 'bronze', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'carlos@escola.com', adapted_by_iara: true,
      questions: [
        {
          id: 'q1', type: 'multipla_escolha',
          statement: 'Qual país colonizou o Brasil?',
          options: [{ id: 'a', text: 'Espanha' }, { id: 'b', text: 'Portugal' }, { id: 'c', text: 'França' }, { id: 'd', text: 'Inglaterra' }],
          correct_answer: 'b', explanation: 'O Brasil foi colonizado por Portugal a partir de 1500.',
          points: 10,
        },
        {
          id: 'q2', type: 'verdadeiro_falso',
          statement: 'O primeiro produto explorado pelos portugueses no Brasil foi o pau-brasil. Essa afirmação é verdadeira?',
          options: [{ id: 'verdadeiro', text: 'Verdadeiro' }, { id: 'falso', text: 'Falso' }],
          correct_answer: 'verdadeiro', explanation: 'Sim! O pau-brasil era a madeira que tingia tecidos de vermelho.',
          points: 10,
        },
        {
          id: 'q3', type: 'numerica',
          statement: 'Em que ano os portugueses chegaram ao Brasil?',
          options: [{ id: 'a', text: '1500' }, { id: 'b', text: '1600' }, { id: 'c', text: '1492' }, { id: 'd', text: '1400' }],
          correct_answer: 'a', explanation: 'Pedro Álvares Cabral chegou ao Brasil em 22 de abril de 1500.',
          points: 10,
        },
        {
          id: 'q4', type: 'multipla_escolha',
          statement: 'Como se chamava o sistema de trabalho escravo usado pelos portugueses no Brasil colonial?',
          options: [{ id: 'a', text: 'Minerador' }, { id: 'b', text: 'Escravidão' }, { id: 'c', text: 'Assalariado' }, { id: 'd', text: 'Voluntário' }],
          correct_answer: 'b', explanation: 'A escravidão foi o principal sistema de trabalho no Brasil colonial, com africanos trazidos à força.',
          points: 10,
        },
      ],
    },
    {
      id: 'act_geo1',
      title: 'Geo Memória das Capitais',
      description: 'Vire as cartas e encontre o par entre cada estado e sua capital no jogo da memória!',
      subject: 'geografia', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF06GE01', 'EF06GE03'], descriptor_code: 'EF06GE01',
      game_mode: 'jogo_memoria', phase: 1, difficulty: 'facil', xp_reward: 25,
      medal: 'bronze', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'marina@escola.com', adapted_by_iara: true,
      game_content: {
        pairs: [
          { left: 'São Paulo', right: 'Capital do estado de SP' },
          { left: 'Rio de Janeiro', right: 'Cidade sede do Cristo Redentor' },
          { left: 'Bahia', right: 'Estado da capital Salvador' },
          { left: 'Minas Gerais', right: 'Estado da capital Belo Horizonte' },
          { left: 'Paraná', right: 'Estado da capital Curitiba' },
          { left: 'Amazonas', right: 'Estado da capital Manaus' },
          { left: 'Pernambuco', right: 'Estado da capital Recife' },
          { left: 'Ceará', right: 'Estado da capital Fortaleza' },
        ],
      },
    },
    {
      id: 'act_geo2',
      title: 'Forca dos Biomas',
      description: 'Descubra os biomas brasileiros letra por letra antes de completar a forca!',
      subject: 'geografia', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF06GE05'], descriptor_code: 'EF06GE05',
      game_mode: 'forca', phase: 1, difficulty: 'medio', xp_reward: 30,
      medal: 'prata', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'marina@escola.com', adapted_by_iara: true,
      game_content: {
        words: [
          { word: 'AMAZONIA', hint: 'Maior floresta tropical do mundo' },
          { word: 'CERRADO', hint: 'Bioma do centro-oeste com árvores tortas' },
          { word: 'CAATINGA', hint: 'Bioma do sertão nordestino, chuvas escassas' },
          { word: 'PAMPA', hint: 'Campos do extremo sul do Brasil' },
          { word: 'PANTANAL', hint: 'Maior planície alagada do mundo' },
        ],
      },
    },
    {
      id: 'act_art1',
      title: 'Caça-Palavras das Artes',
      description: 'Encontre escondidas as palavras do mundo das artes nesta sopa de letras colorida!',
      subject: 'arte', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF69AR01', 'EF69AR31'], descriptor_code: 'EF69AR01',
      game_mode: 'caca_palavras', phase: 1, difficulty: 'facil', xp_reward: 25,
      medal: 'bronze', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'carlos@escola.com', adapted_by_iara: true,
      game_content: {
        words: ['PINTURA', 'ESCULTURA', 'DANCA', 'MUSICA', 'TEATRO', 'COR', 'MOSAICO', 'PINCEL'],
      },
    },
    {
      id: 'act_ing1',
      title: 'English Memory Adventure',
      description: 'Memorize os pares de palavras em inglês e português nesta aventura bilíngue!',
      subject: 'lingua_inglesa', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF06LI01', 'EF06LI07'], descriptor_code: 'EF06LI01',
      game_mode: 'jogo_memoria', phase: 1, difficulty: 'medio', xp_reward: 30,
      medal: 'prata', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'carlos@escola.com', adapted_by_iara: true,
      game_content: {
        pairs: [
          { left: 'Hello', right: 'Olá' },
          { left: 'Good morning', right: 'Bom dia' },
          { left: 'Friend', right: 'Amigo' },
          { left: 'Teacher', right: 'Professor(a)' },
          { left: 'Book', right: 'Livro' },
          { left: 'School', right: 'Escola' },
          { left: 'Water', right: 'Água' },
          { left: 'Family', right: 'Família' },
        ],
      },
    },
    {
      id: 'act_ef1',
      title: 'Forca dos Esportes',
      description: 'Descubra os esportes escondidos na forca e aprenda sobre movimentos do corpo!',
      subject: 'educacao_fisica', grade_level: '6_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF67EF01', 'EF67EF03'], descriptor_code: 'EF67EF01',
      game_mode: 'forca', phase: 1, difficulty: 'facil', xp_reward: 25,
      medal: 'bronze', status: 'publicada', assigned_class_ids: ['cls_6a'],
      created_by_email: 'marina@escola.com', adapted_by_iara: true,
      game_content: {
        words: [
          { word: 'FUTEBOL', hint: 'Esporte mais popular do Brasil' },
          { word: 'VOLEI', hint: 'Esporte jogado com as mãos sobre a rede' },
          { word: 'BASQUETE', hint: 'Joga-se a bola em uma cesta' },
          { word: 'NATACAO', hint: 'Esporte praticado na água' },
          { word: 'CAPOEIRA', hint: 'Luta esportiva de origem brasileira ritual' },
        ],
      },
    },
    {
      id: 'act_mat3',
      title: 'Caça-Números da Tabuada',
      description: 'Encontre escondidas as palavras mágicas da matemática nesta sopa de números!',
      subject: 'matematica', grade_level: '7_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF07MA01', 'EF07MA02'], descriptor_code: 'EF07MA01',
      game_mode: 'caca_palavras', phase: 2, difficulty: 'medio', xp_reward: 30,
      medal: 'prata', status: 'publicada', assigned_class_ids: ['cls_7a'],
      created_by_email: 'marina@escola.com', adapted_by_iara: true,
      game_content: {
        words: ['NUMERO', 'SOMA', 'PRODUTO', 'QUOCIENTE', 'FRACAO', 'DECIMAL', 'ANGULO', 'TRIANGULO'],
      },
    },
    {
      id: 'act_port2',
      title: 'Memória das Figuras de Linguagem',
      description: 'Encontre os pares entre cada figura de linguagem e seu significado!',
      subject: 'lingua_portuguesa', grade_level: '7_ano_fund', curriculum_framework: 'bncc',
      bncc_skills: ['EF67LP38', 'EF67LP32'], descriptor_code: 'EF67LP38',
      game_mode: 'jogo_memoria', phase: 2, difficulty: 'facil', xp_reward: 30,
      medal: 'prata', status: 'publicada', assigned_class_ids: ['cls_7a'],
      created_by_email: 'carlos@escola.com', adapted_by_iara: true,
      game_content: {
        pairs: [
          { left: 'Metáfora', right: 'Comparação sem palavra comparativa' },
          { left: 'Metonímia', right: 'Troca de uma palavra por outra ligada: ler Machado de Assis' },
          { left: 'Hipérbole', right: 'Exagero intencional: chorar rios' },
          { left: 'Antítese', right: 'Ideias opostas juntas: claro e escuro' },
          { left: 'Personificação', right: 'Dar vida a objetos inanimados' },
          { left: 'Onomatopeia', right: 'Palavra que imita sons: tic-tac' },
        ],
      },
    },
  ];

  const attempts = [
    {
      id: 'att1', student_email: 'joao@escola.com', student_name: 'Joãozinho',
      activity_id: 'act_math1', activity_title: 'Frações na Fazenda', class_id: 'cls_6a',
      subject: 'matematica',
      answers: [
        { question_id: 'q1', user_answer: 'a', correct_answer: 'a', is_correct: true, time_spent_seconds: 12, ai_explanation: 'Boa! 12 ÷ 3 = 4.' },
        { question_id: 'q2', user_answer: 'b', correct_answer: 'b', is_correct: true, time_spent_seconds: 9, ai_explanation: 'Exato, 1/2.' },
        { question_id: 'q3', user_answer: 'verdadeiro', correct_answer: 'verdadeiro', is_correct: true, time_spent_seconds: 15, ai_explanation: 'Correto.' },
        { question_id: 'q4', user_answer: 'a', correct_answer: 'a', is_correct: true, time_spent_seconds: 20, ai_explanation: '2/3 + 1/3 = 1.' },
      ],
      score: 100, correct_count: 4, total_questions: 4, xp_earned: 20, time_spent_seconds: 56,
      status: 'concluida', ai_feedback: 'Excelente! Você dominou frações com perfeição. Continue assim!',
      weak_bncc_skills: [], submitted_at: daysAgo(9),
    },
    {
      id: 'att2', student_email: 'joao@escola.com', student_name: 'Joãozinho',
      activity_id: 'act_math2', activity_title: 'Desafio de Operações', class_id: 'cls_6a',
      subject: 'matematica',
      answers: [
        { question_id: 'q1', user_answer: 'b', correct_answer: 'b', is_correct: true, time_spent_seconds: 18, ai_explanation: 'Ótimo!' },
        { question_id: 'q2', user_answer: 'a', correct_answer: 'a', is_correct: true, time_spent_seconds: 22, ai_explanation: 'Perfeito, 58 moedas.' },
        { question_id: 'q3', user_answer: 'b', correct_answer: 'b', is_correct: true, time_spent_seconds: 8, ai_explanation: '8×7=56.' },
        { question_id: 'q4', user_answer: 'verdadeiro', correct_answer: 'verdadeiro', is_correct: true, time_spent_seconds: 6, ai_explanation: '100÷4=25.' },
      ],
      score: 100, correct_count: 4, total_questions: 4, xp_earned: 30, time_spent_seconds: 54,
      status: 'concluida', ai_feedback: 'Operações em dia! Você está pronto para desafios maiores.',
      weak_bncc_skills: [], submitted_at: daysAgo(6),
    },
    {
      id: 'att3', student_email: 'joao@escola.com', student_name: 'Joãozinho',
      activity_id: 'act_port1', activity_title: 'Aventura de Leitura', class_id: 'cls_6a',
      subject: 'lingua_portuguesa',
      answers: [
        { question_id: 'q1', user_answer: 'a', correct_answer: 'a', is_correct: true, time_spent_seconds: 25, ai_explanation: 'Muito bem!' },
        { question_id: 'q2', user_answer: 'verdadeiro', correct_answer: 'verdadeiro', is_correct: true, time_spent_seconds: 10, ai_explanation: 'Isso!' },
        { question_id: 'q3', user_answer: 'b', correct_answer: 'a', is_correct: false, time_spent_seconds: 30, ai_explanation: 'A Iara é a senhora das ÁGUAS.' },
      ],
      score: 67, correct_count: 2, total_questions: 3, xp_earned: 15, time_spent_seconds: 65,
      status: 'concluida', ai_feedback: 'Bom trabalho! Revise o conceito de metáforas relacionadas ao folclore.',
      weak_bncc_skills: ['EF67LP03'], submitted_at: daysAgo(4),
    },
    {
      id: 'att4', student_email: 'joao@escola.com', student_name: 'Joãozinho',
      activity_id: 'act_cie1', activity_title: 'Ciências da Natureza', class_id: 'cls_6a',
      subject: 'ciencias',
      answers: [
        { question_id: 'q1', user_answer: 'a', correct_answer: 'a', is_correct: true, time_spent_seconds: 14, ai_explanation: 'Ciclo da água!' },
        { question_id: 'q2', user_answer: 'falso', correct_answer: 'falso', is_correct: true, time_spent_seconds: 20, ai_explanation: 'Exato, pouca água é potável.' },
      ],
      score: 100, correct_count: 2, total_questions: 2, xp_earned: 25, time_spent_seconds: 34,
      status: 'concluida', ai_feedback: 'Você entende bem os ecossistemas de água doce.',
      weak_bncc_skills: [], submitted_at: daysAgo(2),
    },
    {
      id: 'att5', student_email: 'ana@escola.com', student_name: 'Ana Beatriz',
      activity_id: 'act_cie1', activity_title: 'Ciências da Natureza', class_id: 'cls_6a',
      subject: 'ciencias',
      answers: [
        { question_id: 'q1', user_answer: 'a', correct_answer: 'a', is_correct: true, time_spent_seconds: 16, ai_explanation: 'Ótimo' },
        { question_id: 'q2', user_answer: 'falso', correct_answer: 'falso', is_correct: true, time_spent_seconds: 12, ai_explanation: 'Isso' },
      ],
      score: 100, correct_count: 2, total_questions: 2, xp_earned: 25, time_spent_seconds: 28,
      status: 'concluida', ai_feedback: 'Excelente desempenho em Ciências.',
      weak_bncc_skills: [], submitted_at: daysAgo(1),
    },
  ];

  const characters = [
    {
      id: 'char1', student_email: 'joao@escola.com', student_name: 'Joãozinho',
      profession: 'engenheiro', profession_label: 'Engenheiro Agrônomo',
      avatar_emoji: '🦊', color: 'from-violet-500 to-indigo-500',
      level: 6, xp: 340, coins: 120, diamonds: 3, stars: 5,
      unlocked_cities: ['fazenda', 'cidade_dos_numeros', 'floresta_da_lingua'],
      unlocked_avatars: ['🦊', '🐯', '🐼'],
    },
    {
      id: 'char2', student_email: 'ana@escola.com', student_name: 'Ana Beatriz',
      profession: 'astronauta', profession_label: 'Astronauta',
      avatar_emoji: '🐱', color: 'from-sky-500 to-cyan-500',
      level: 4, xp: 210, coins: 80, diamonds: 2, stars: 4,
      unlocked_cities: ['fazenda', 'cidade_dos_numeros'],
      unlocked_avatars: ['🐱', '🐰'],
    },
  ];

  const groups = [
    {
      id: 'grp1', name: 'Super Cientistas', class_id: 'cls_6a',
      created_by_email: 'marina@escola.com', group_type: 'competicao', phase: 1,
      student_emails: ['joao@escola.com', 'ana@escola.com', 'pedro@escola.com'],
      activity_ids: ['act_math1', 'act_cie1'], emoji: '🔬',
    },
  ];

  const notices = [
    {
      id: 'ntc1', title: 'Bem-vindos ao IARA EDU!',
      content: '**Olá, turma!** Na semana que vem começaremos o **Desafio das Frações** para o 6º ano.\n\nNão esqueçam de completar suas atividades diárias para ganhar XP e medalhas.',
      audience: 'alunos', author_email: 'marina@escola.com', author_name: 'Professora Marina',
      author_role: 'professor', category: 'aviso', pinned: true, created_at: daysAgo(5),
    },
    {
      id: 'ntc2', title: 'Reunião de pais',
      content: 'No dia 15 haverá reunião de pais e mestres às 18h no auditório. Confirme sua presença com a secretaria.',
      audience: 'pai', author_email: 'diretor@escola.com', author_name: 'Diretor Everaldo',
      author_role: 'direcao', category: 'evento', pinned: false, created_at: daysAgo(3),
    },
    {
      id: 'ntc3', title: 'Quiz de Ciências liberado!',
      content: 'A atividade **Ciências da Natureza** já está publicada. Vale medalha de prata! 🌿',
      audience: 'alunos', author_email: 'marina@escola.com', author_name: 'Professora Marina',
      author_role: 'professor', category: 'comunicado', pinned: false, created_at: daysAgo(1),
    },
  ];

  const attendances = [
    {
      id: 'atd1', class_id: 'cls_6a', class_name: '6º Ano A', date: daysAgo(1),
      present_emails: ['joao@escola.com', 'ana@escola.com'],
      absent_emails: ['pedro@escola.com'],
      recorded_by_email: 'marina@escola.com', notes: '',
    },
    {
      id: 'atd2', class_id: 'cls_6a', class_name: '6º Ano A', date: daysAgo(2),
      present_emails: ['joao@escola.com', 'ana@escola.com', 'pedro@escola.com'],
      absent_emails: [], recorded_by_email: 'marina@escola.com', notes: '',
    },
    {
      id: 'atd3', class_id: 'cls_6a', class_name: '6º Ano A', date: daysAgo(3),
      present_emails: ['joao@escola.com', 'pedro@escola.com'],
      absent_emails: ['ana@escola.com'], recorded_by_email: 'marina@escola.com', notes: '',
    },
  ];

  const conversations = [
    {
      id: 'conv1', title: 'Help Iara começar treino de frações',
      messages: [
        { role: 'user', content: 'Oi Iara! Como eu posso melhorar em frações?', ts: daysAgo(1) },
        { role: 'iara', content: 'Olá, Joãozinho! 🦊 O segredo é praticar 10 minutos por dia. Comece na atividade "Frações na Fazenda" e depois tente o desafio médio. Você já acertou 100% das frações!' },
      ],
      context_type: 'chat', created_at: daysAgo(1),
    },
  ];

  const reports = [
    {
      id: 'rep1', title: 'Relatório individual — Joãozinho',
      student_email: 'joao@escola.com', student_name: 'Joãozinho', class_id: 'cls_6a',
      report_type: 'desempenho_individual', target_role: 'pai',
      generated_by_email: 'marina@escola.com',
      content: '## Progresso do Joãozinho\n\nO aluno apresenta ótimo desempenho em **matemática**, com 100% de acerto nas últimas atividades. Em **Língua Portuguesa**, recomendamos reforço na interpretação de textos de folclore.',
      summary: { accuracy: 92, xp: 340, attempts: 4, attendance_rate: 100 },
      period_start: daysAgo(14), period_end: now(), created_at: daysAgo(1),
    },
  ];

  return {
    users: [admin, teacher, teacher2, student, student2, student3, parent],
    classes, activities, attempts, characters, groups, notices, attendances,
    conversations, reports, farms: [], events: [],
  };
};

const emptyDb = () => ({
  users: [], classes: [], activities: [], attempts: [], characters: [], groups: [],
  notices: [], attendances: [], conversations: [], reports: [], farms: [], events: [],
});

// Garante que TODAS as contas de demonstração existam e entrem sem senha,
// mesmo quando o usuário já tem um cache sincronizado vindo da nuvem.
const ensureDemoUsers = (d) => {
  if (!d.users) d.users = [];
  const hasCls6a = Array.isArray(d.classes) && d.classes.some((c) => c.id === 'cls_6a');
  DEMO_ACCOUNTS.forEach((demo) => {
    const cur = d.users.find((u) => u.email === demo.email);
    if (cur) {
      delete cur.password_hash;
      if (!cur.role) cur.role = demo.role;
    } else {
      d.users.push({
        id: demo.id,
        role: demo.role,
        name: demo.name,
        email: demo.email,
        school_name: 'Escola Municipal Sonho Dourado',
        grade_level: demo.role === 'aluno' ? '6_ano_fund' : '',
        class_id: demo.role === 'aluno' && hasCls6a ? 'cls_6a' : '',
        xp: 0, level: 1, badges: [], total_activities: 0, total_correct: 0, streak_days: 0,
      });
    }
  });
};

let pulledCloud = false;
const load = () => {
  let db;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.farms) parsed.farms = [];
      if (!parsed.events) parsed.events = [];
      db = parsed;
    }
  } catch (e) {
    db = null;
  }
  if (!db) {
    db = buildSeed();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      // ignore
    }
  } else {
    ensureDemoUsers(db);
  }
  if (!pulledCloud) {
    pulledCloud = true;
    pullFromCloud(db).then((merged) => {
      if (merged) ensureDemoUsers(merged);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged || db));
      } catch (e) {
        // ignore
      }
      const evt = new Event('iara:cloud-synced');
      dispatchEvent(evt);
    });
  }
  return db;
};

const persist = (db) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    // ignore
  }
  scheduleCloudSync(db);
};

export const db = {
  storageKey: STORAGE_KEY,

  get(collection, filters = {}) {
    let rows = load()[collection] || [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      rows = rows.filter((row) => {
        if (typeof value === 'function') return value(row);
        const field = row[key];
        if (Array.isArray(value)) return value.includes(field);
        if (Array.isArray(field)) return field.includes(value);
        return field === value;
      });
    });
    return rows;
  },

  findAll(collection, sortBy = null, dir = 'desc') {
    const rows = [...(load()[collection] || [])];
    if (sortBy) {
      rows.sort((a, b) => {
        const av = a[sortBy]; const bv = b[sortBy];
        if (av === bv) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        const cmp = av > bv ? 1 : -1;
        return dir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  },

  findById(collection, id) {
    return (load()[collection] || []).find((row) => row.id === id) || null;
  },

  insert(collection, data) {
    const d = load();
    const row = { id: uid(collection === 'users' ? 'usr' : collection.toLowerCase().replace(/s$/, '')), created_at: now(), updated_at: Date.now(), ...data };
    d[collection].push(row);
    persist(d);
    return row;
  },

  update(collection, id, patch) {
    const d = load();
    const idx = d[collection].findIndex((r) => r.id === id);
    if (idx === -1) return null;
    d[collection][idx] = { ...d[collection][idx], ...patch, updated_at: Date.now() };
    persist(d);
    return d[collection][idx];
  },

  remove(collection, id) {
    const d = load();
    d[collection] = d[collection].filter((r) => r.id !== id);
    persist(d);
    return true;
  },

  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    return buildSeed();
  },
};

export const emptyDatabase = emptyDb;