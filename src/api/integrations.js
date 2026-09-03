import { db } from './db';

export const now = () => new Date().toISOString();

export const PROFESSIONS = [
  { id: 'engenheiro', label: 'Engenheiro Agrônomo', emoji: '🚜' },
  { id: 'astronauta', label: 'Astronauta', emoji: '🚀' },
  { id: 'medica', label: 'Médica', emoji: '🩺' },
  { id: 'professor', label: 'Professor', emoji: '📚' },
  { id: 'cientista', label: 'Cientista', emoji: '🔬' },
  { id: 'artista', label: 'Artista', emoji: '🎨' },
  { id: 'programmer', label: 'Programadora', emoji: '💻' },
  { id: 'astronomo', label: 'Astrônomo', emoji: '🔭' },
];

export const AVATARS = [
  '🦊', '🐯', '🐼', '🐱', '🐰', '🦁', '🐸', '🦄', '🐻', '🐨',
  '🐷', '🐮', '🦓', '🦒', '🐵', '🐶', '🐺', '🦝', '🐭', '🐹',
  '🐻‍❄️', '🐧', '🦉', '🦅', '🐦', '🦆', '🦢', '🦜', '🦚', '🦩',
  '🐢', '🐍', '🦎', '🐊', '🐙', '🦑', '🦀', '🐬', '🐳', '🐋',
  '🦈', '🦭', '🐝', '🦋', '🐞', '🕷️', '🦕', '🦖', '👧', '🧒',
  '👦', '👩', '🧑', '👨', '🧙', '🧚', '🧜‍♀️', '🧜‍♂️', '🤖', '👽',
];

export const AVATAR_COLORS = [
  'from-violet-500 to-indigo-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
];

export const MEDALS = [
  { id: 'first_steps', name: 'Primeiros Passos', icon: '🌟', desc: 'Complete sua primeira atividade' },
  { id: 'math_master', name: 'Mestre da Matemática', icon: '🧮', desc: '100% em uma atividade de matemática' },
  { id: 'reading_explorer', name: 'Explorador(a) de Leitura', icon: '📖', desc: '100% em uma atividade de português' },
  { id: 'science_lover', name: 'Explorador(a) de Ciências', icon: '🔬', desc: '100% em uma atividade de ciências' },
  { id: 'streak_3', name: 'Sequência de 3 dias', icon: '🔥', desc: '3 dias seguidos com atividades' },
  { id: 'streak_7', name: 'Semana Completa', icon: '⚡', desc: '7 dias seguidos com atividades' },
  { id: 'perfect_quiz', name: 'Perfeição Total', icon: '💎', desc: 'Acertar 100% de um quiz com 5+ questões' },
  { id: 'fast_solver', name: 'Relâmpago', icon: '⏱️', desc: 'Completar uma atividade em menos de 60s' },
  { id: 'team_player', name: 'Jogador em Equipe', icon: '🤝', desc: 'Participe de uma competição em grupo' },
  { id: 'matematico', name: 'Matemático', icon: '🧮', desc: 'Resolver 100 questões de matemática' },
  { id: 'cientista', name: 'Cientista', icon: '🔬', desc: 'Assistir 50 aulas de ciências' },
  { id: 'agricultor', name: 'Agricultor', icon: '🌽', desc: 'Fazer 500 colheitas na fazenda' },
  { id: 'genio', name: 'Gênio', icon: '💡', desc: 'Tirar 100% em uma prova com 10+ perguntas' },
  { id: 'persistente', name: 'Persistente', icon: '📅', desc: 'Estudar por 30 dias no total' },
];

export const BNCC_SUBJECTS = [
  { id: 'matematica', label: 'Matemática', emoji: '🧮', color: '#7c3aed' },
  { id: 'lingua_portuguesa', label: 'Língua Portuguesa', emoji: '📖', color: '#0ea5e9' },
  { id: 'ciencias', label: 'Ciências', emoji: '🔬', color: '#10b981' },
  { id: 'historia', label: 'História', emoji: '🏛️', color: '#f59e0b' },
  { id: 'geografia', label: 'Geografia', emoji: '🌍', color: '#ef4444' },
  { id: 'arte', label: 'Arte', emoji: '🎨', color: '#ec4899' },
  { id: 'educacao_fisica', label: 'Educação Física', emoji: '⚽', color: '#22c55e' },
  { id: 'lingua_inglesa', label: 'Língua Inglesa', emoji: '🇬🇧', color: '#6366f1' },
  { id: 'ensino_religioso', label: 'Ensino Religioso', emoji: '🕊️', color: '#a855f7' },
];

export const GRADE_LEVELS = [
  '6_ano_fund', '7_ano_fund', '8_ano_fund', '9_ano_fund', '1_medio', '2_medio', '3_medio',
];

export const xpToLevel = (xp) => Math.floor(Math.sqrt(xp / 10)) + 1;

export const levelBounds = (xp) => {
  const level = xpToLevel(xp);
  const start = 10 * (level - 1) * (level - 1);
  const end = 10 * level * level;
  return {
    level,
    start,
    end,
    progress: Math.min(100, ((xp - start) / (end - start)) * 100),
    xpToNext: Math.max(0, end - xp),
  };
};

export const getUserByEmail = (email) =>
  db.get('users', { email })[0] || null;

export const getAllUsers = () => db.findAll('users', 'name', 'asc');

export const hashPassword = (password) => {
  let h = 5381;
  const s = String(password || '');
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `h${(h >>> 0).toString(16)}`;
};

export const registerStudent = ({ name, email, password, grade_level, school_name }) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!String(name || '').trim()) return { ok: false, error: 'Informe seu nome.' };
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return { ok: false, error: 'Informe um e-mail válido.' };
  if (!password || String(password).length < 4) return { ok: false, error: 'A senha precisa ter pelo menos 4 caracteres.' };
  if (getUserByEmail(cleanEmail)) return { ok: false, error: 'Este e-mail já está cadastrado. Faça login!' };

  const gradeLevel = grade_level || '6_ano_fund';
  const possibleClasses = db.get('classes', { grade_level: gradeLevel }).filter(
    (c) => (c.student_emails || []).length < 40,
  );
  const cls = possibleClasses[0] || null;

  const user = db.insert('users', {
    role: 'aluno',
    name: String(name).trim(),
    email: cleanEmail,
    school_name: school_name || 'Escola Municipal Sonho Dourado',
    grade_level: gradeLevel,
    class_id: cls ? cls.id : '',
    password_hash: hashPassword(password),
    xp: 0, level: 1, badges: [], total_activities: 0, total_correct: 0, streak_days: 0,
  });

  if (cls) {
    db.update('classes', cls.id, { student_emails: [...(cls.student_emails || []), cleanEmail] });
  }

  return { ok: true, user };
};

export const getClassById = (id) => db.findById('classes', id);

export const getClassForUser = (user) =>
  user?.class_id ? db.findById('classes', user.class_id) : null;

export const getOrCreateCharacter = (student) => {
  if (!student) return null;
  const existing = db.get('characters', { student_email: student.email })[0];
  if (existing) return existing;
  return db.insert('characters', {
    student_email: student.email,
    student_name: student.name,
    profession: 'cientista',
    profession_label: PROFESSIONS.find((p) => p.id === 'cientista').label,
    avatar_emoji: '🦊',
    color: AVATAR_COLORS[0],
    level: 1, xp: 0, coins: 0, diamonds: 0, stars: 0,
    unlocked_cities: ['fazenda'],
    unlocked_avatars: ['🦊'],
  });
};

export const checkAnswer = (question, userAnswer) => {
  if (!userAnswer || userAnswer === '') return false;
  if (question.type === 'correspondencia') {
    const canonicalCorrect = JSON.stringify(
      (question.pairs || []).map((_, i) => [String(i), question.pairs[i].right]),
    );
    return userAnswer === canonicalCorrect;
  }
  return userAnswer === question.correct_answer;
};

export const submitAttempt = async ({ student, activity, answers, gameAnswers, gameScore, timeSpentSeconds }) => {
  const isGameMode = ['jogo_memoria', 'forca', 'caca_palavras'].includes(activity.game_mode);
  const questionCount = isGameMode ? (gameAnswers?.length || 0) : activity.questions.length;

  let resolvedAnswers;
  if (isGameMode) {
    resolvedAnswers = (gameAnswers || []).map((a, i) => ({
      question_id: a.question_id || `g_${i + 1}`,
      user_answer: a.user_answer ?? '',
      correct_answer: a.correct_answer ?? '',
      is_correct: !!a.is_correct,
      time_spent_seconds: Number(a.time_spent_seconds) || 0,
      ai_explanation: a.is_correct ? 'Você acertou! Muito bem!' : 'Continue praticando para melhorar!',
    }));
  } else {
    resolvedAnswers = activity.questions.map((q, i) => {
      const answer = answers[i] || { user_answer: '', time_spent_seconds: 0 };
      const correct = checkAnswer(q, answer.user_answer);
      return {
        question_id: q.id,
        user_answer: answer.user_answer ?? '',
        correct_answer: q.correct_answer,
        is_correct: correct,
        time_spent_seconds: Number(answer.time_spent_seconds) || 0,
        ai_explanation: correct ? 'Você acertou! Muito bem!' : q.explanation || 'Revise este conteúdo com a professora.',
      };
    });
  }

  const correctCount = resolvedAnswers.filter((a) => a.is_correct).length;
  const score = isGameMode && gameScore != null
    ? Math.max(0, Math.min(100, Math.round(gameScore)))
    : questionCount ? Math.round((correctCount / questionCount) * 100) : 0;
  const xpEarned = score >= 70 ? activity.xp_reward : Math.round(activity.xp_reward / 2);
  const weak = resolvedAnswers.filter((a) => !a.is_correct);
  const weakSkills = weak.length ? activity.bncc_skills || [] : [];

  const feedback =
    score === 100
      ? 'Perfeito! Você mandou muito bem. A Iara está orgulhosa de você! 🌟'
      : score >= 70
        ? 'Ótimo trabalho! Você já domina boa parte do conteúdo. Continue praticando.'
        : 'Não desanime! A prática leva à perfeição. Reveja as explicações e tente novamente.';

  const attempt = db.insert('attempts', {
    student_email: student.email,
    student_name: student.name,
    activity_id: activity.id,
    activity_title: activity.title,
    class_id: student.class_id || '',
    subject: activity.subject,
    answers: resolvedAnswers,
    score, correct_count: correctCount, total_questions: questionCount,
    xp_earned: xpEarned, time_spent_seconds: timeSpentSeconds,
    status: 'concluida', ai_feedback: feedback, weak_bncc_skills: weakSkills,
    submitted_at: new Date().toISOString(),
  });

  const user = getUserByEmail(student.email);
  let levelUp = false;
  const badges = [...(user?.badges || [])];
  if (user) {
    const baseXp = user.xp || 0;
    const newXp = baseXp + xpEarned;
    const oldLevel = user.level || xpToLevel(baseXp);
    const newLevel = xpToLevel(newXp);
    levelUp = newLevel > oldLevel;
    const earned = (name, icon) => ({
      name, icon, earned_date: new Date().toISOString(),
    });
    if (!badges.find((b) => b.name === 'Primeiros Passos')) badges.push(earned('Primeiros Passos', '🌟'));
    if (activity.subject === 'matematica' && score === 100 && !badges.find((b) => b.name === 'Mestre da Matemática')) {
      badges.push(earned('Mestre da Matemática', '🧮'));
    }
    if (activity.subject === 'lingua_portuguesa' && score === 100 && !badges.find((b) => b.name === 'Explorador(a) de Leitura')) {
      badges.push(earned('Explorador(a) de Leitura', '📖'));
    }
    if (activity.subject === 'ciencias' && score === 100 && !badges.find((b) => b.name === 'Explorador(a) de Ciências')) {
      badges.push(earned('Explorador(a) de Ciências', '🔬'));
    }
    if (questionCount >= 5 && score === 100 && !badges.find((b) => b.name === 'Perfeição Total')) {
      badges.push(earned('Perfeição Total', '💎'));
    }
    if (questionCount >= 10 && score === 100 && !badges.find((b) => b.name === 'Gênio')) {
      badges.push(earned('Gênio', '💡'));
    }
    if (activity.subject === 'matematica' && (user.total_correct || 0) + correctCount >= 100 && !badges.find((b) => b.name === 'Matemático')) {
      badges.push(earned('Matemático', '🧮'));
    }
    if (activity.subject === 'ciencias' && (user.total_activities || 0) + 1 >= 50 && !badges.find((b) => b.name === 'Cientista')) {
      badges.push(earned('Cientista', '🔬'));
    }
    if ((user.study_days || 0) + 1 >= 30 && !badges.find((b) => b.name === 'Persistente')) {
      badges.push(earned('Persistente', '📅'));
    }
    if (timeSpentSeconds < 60 && score === 100 && !badges.find((b) => b.name === 'Relâmpago')) {
      badges.push(earned('Relâmpago', '⏱️'));
    }

    const streak = (user.streak_days || 0) + 1;
    if (streak === 3 && !badges.find((b) => b.name === 'Sequência de 3 dias')) {
      badges.push(earned('Sequência de 3 dias', '🔥'));
    }
    if (streak === 7 && !badges.find((b) => b.name === 'Semana Completa')) {
      badges.push(earned('Semana Completa', '⚡'));
    }

    db.update('users', user.id, {
      xp: newXp,
      level: newLevel,
      total_activities: (user.total_activities || 0) + 1,
      total_correct: (user.total_correct || 0) + correctCount,
      study_days: (user.study_days || 0) + 1,
      streak_days: streak,
      badges,
    });
  }

  const character = db.get('characters', { student_email: student.email })[0];
  if (character) {
    const coils = (character.coins || 0) + Math.min(10, correctCount * 2);
    db.update('characters', character.id, {
      xp: (character.xp || 0) + xpEarned,
      level: xpToLevel((character.xp || 0) + xpEarned),
      coins: coils,
      stars: (character.stars || 0) + (score === 100 ? 1 : 0),
      diamonds: (character.diamonds || 0) + (score === 100 && questionCount >= 5 ? 1 : 0),
    });
  }

  // A Fazendinha: ganho de milhos por atividade concluída
  const farm = db.get('farms', { student_email: student.email })[0];
  if (farm) {
    let milhos = 10;
    if (!isGameMode) milhos = score >= 80 ? 50 : 20;
    if (score === 100) milhos += 10;
    const farmXp = ((farm.xp || 0) + xpEarned);
    const today = new Date().toISOString().slice(0, 10);
    const resets = farm.mission_date !== today;
    db.update('farms', farm.id, {
      milhos: (farm.milhos || 0) + milhos,
      xp: farmXp,
      level: farmLevelFor(farmXp),
      energy: Math.min(energyMaxFor(farmXp), (farm.energy || 0) + 10),
      atividades_concluidas: (farm.atividades_concluidas || 0) + 1,
      total_questoes: (farm.total_questoes || 0) + questionCount,
      mission_date: today,
      atividades_today: (resets ? 0 : farm.atividades_today || 0) + 1,
      questoes_today: (resets ? 0 : farm.questoes_today || 0) + questionCount,
      xp_today: (resets ? 0 : farm.xp_today || 0) + xpEarned,
      updated_at: new Date().toISOString(),
    });
  }

  return { attempt, xpEarned, levelUp, newBadges: badges };
};

export const attemptsForUser = (email) =>
  db.findAll('attempts', 'submitted_at', 'desc').filter((a) => a.student_email === email);

export const getStudentReportData = (email) => {
  const attempts = attemptsForUser(email);
  const total = attempts.length;
  const correct = attempts.reduce((acc, a) => acc + (a.correct_count || 0), 0);
  const questions = attempts.reduce((acc, a) => acc + (a.total_questions || 0), 0);
  const xp = attempts.reduce((acc, a) => acc + (a.xp_earned || 0), 0);
  const accuracy = total ? Math.round((correct / (questions || 1)) * 100) : 0;
  const bySubject = {};
  attempts.forEach((a) => {
    bySubject[a.subject] = bySubject[a.subject] || { correct: 0, total: 0, count: 0 };
    bySubject[a.subject].correct += a.correct_count || 0;
    bySubject[a.subject].total += a.total_questions || 0;
    bySubject[a.subject].count += 1;
  });
  const weakSkills = [...new Set(attempts.flatMap((a) => a.weak_bncc_skills || []))];
  return { attempts, total, correct, questions, xp, accuracy, bySubject, weakSkills };
};

export const attendanceRateForClass = (classId) => {
  const records = db.get('attendances', { class_id: classId });
  let present = 0;
  let total = 0;
  records.forEach((r) => {
    present += r.present_emails.length;
    total += r.present_emails.length + r.absent_emails.length;
  });
  return total ? Math.round((present / total) * 100) : 100;
};

export const getDashboardStats = () => {
  const users = db.get('users');
  const students = users.filter((u) => u.role === 'aluno');
  const teachers = users.filter((u) => u.role === 'professor');
  const activities = db.get('activities');
  const attempts = db.get('attempts');
  const classes = db.get('classes');
  const totals = attempts.reduce((acc, a) => acc + (a.total_questions || 0), 0);
  const corrects = attempts.reduce((acc, a) => acc + (a.correct_count || 0), 0);
  const bySubject = {};
  attempts.forEach((a) => {
    bySubject[a.subject] = bySubject[a.subject] || { correct: 0, total: 0 };
    bySubject[a.subject].correct += a.correct_count || 0;
    bySubject[a.subject].total += a.total_questions || 0;
  });
  const weak = {};
  attempts.forEach((a) => (a.weak_bncc_skills || []).forEach((s) => { weak[s] = (weak[s] || 0) + 1; }));
  const topStudents = students
    .map((s) => ({ ...s, character: db.get('characters', { student_email: s.email })[0] }))
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 5);
  return {
    studentsCount: students.length,
    teachersCount: teachers.length,
    classesCount: classes.length,
    activitiesCount: activities.length,
    attemptsCount: attempts.length,
    accuracy: totals ? Math.round((corrects / totals) * 100) : 0,
    totalXp: attempts.reduce((acc, a) => acc + (a.xp_earned || 0), 0),
    bySubject,
    weak,
    topStudents,
  };
};

export const generateReport = async ({ type, subject, generatedBy }) => {
  let students = [];
  if (type === 'turma' && subject?.classId) {
    const cls = db.findById('classes', subject.classId);
    students = db.get('users', { role: 'aluno' }).filter((u) => cls?.student_emails?.includes(u.email));
  } else if (type === 'turma') {
    students = db.get('users', { role: 'aluno' });
  } else {
    students = subject?.email ? [getUserByEmail(subject.email)].filter(Boolean) : [];
  }
  if (!students.length) return null;

  const lines = [`# Relatório de ${type === 'turma' ? 'turma' : 'desempenho individual'}`, ''];
  const summaries = [];
  students.forEach((s) => {
    const data = getStudentReportData(s.email);
    const rate = attendanceRateForClass(s.class_id);
    summaries.push({
      student_email: s.email, student_name: s.name,
      accuracy: data.accuracy, xp: data.xp, attempts: data.total, attendance_rate: rate,
    });
    lines.push(`## ${s.name}`, '');
    lines.push(`- **Aproveitamento:** ${data.accuracy}%`);
    lines.push(`- **XP acumulado:** ${data.xp}`);
    lines.push(`- **Atividades concluídas:** ${data.total}`);
    lines.push(`- **Frequência:** ${rate}%`);
    if (data.weakSkills.length) lines.push(`- **Pontos a reforçar:** ${data.weakSkills.join(', ')}`);
    lines.push('');
  });

  const avgAccuracy = Math.round(summaries.reduce((a, s) => a + s.accuracy, 0) / (summaries.length || 1));
  const avgXp = Math.round(summaries.reduce((a, s) => a + s.xp, 0) / (summaries.length || 1));

  const report = db.insert('reports', {
    title: `Relatório de ${type === 'turma' ? 'turma' : 'aluno'} — ${new Date().toLocaleDateString('pt-BR')}`,
    student_email: type === 'individual' ? students[0].email : '',
    student_name: type === 'individual' ? students[0].name : '',
    class_id: type === 'turma' ? (subject?.classId || '') : '',
    report_type: type === 'individual' ? 'desempenho_individual' : 'desempenho_turma',
    target_role: generatedBy.role === 'pai' ? 'pai' : 'professor',
    generated_by_email: generatedBy.email,
    content: lines.join('\n'),
    summary: {
      accuracy: avgAccuracy, xp: avgXp,
      attempts: summaries.reduce((a, s) => a + s.attempts, 0),
      attendance_rate: Math.round(summaries.reduce((a, s) => a + s.attendance_rate, 0) / (summaries.length || 1)),
    },
    period_start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    period_end: new Date().toISOString(),
  });
  return report;
};

export const userLevelFromXp = xpToLevel;

export const getUnlockedCitiesFor = (character) => character?.unlocked_cities || ['fazenda'];

export const CITIES = [
  { id: 'fazenda', name: 'Fazenda da Iara', emoji: '🏡', desc: 'Sua base inicial' },
  { id: 'cidade_dos_numeros', name: 'Cidade dos Números', emoji: '🧮', desc: 'Domínio da matemática' },
  { id: 'floresta_da_lingua', name: 'Floresta das Palavras', emoji: '🌲', desc: 'Domínio da língua portuguesa' },
  { id: 'vale_das_ciencias', name: 'Vale das Ciências', emoji: '🔬', desc: 'Domínio das ciências' },
  { id: 'porto_da_historia', name: 'Porto da História', emoji: '⛵', desc: 'Domínio da história' },
];

export const CROPS = [
  { id: 'milho', name: 'Milho', emoji: '🌽', time: 60, xp: 10, level: 1 },
  { id: 'trigo', name: 'Trigo', emoji: '🌾', time: 240, xp: 20, level: 2 },
  { id: 'cenoura', name: 'Cenoura', emoji: '🥕', time: 120, xp: 15, level: 1 },
  { id: 'alface', name: 'Alface', emoji: '🥬', time: 90, xp: 12, level: 1 },
  { id: 'cafe', name: 'Café', emoji: '☕', time: 600, xp: 50, level: 4 },
  { id: 'cacau', name: 'Cacau', emoji: '🍫', time: 900, xp: 70, level: 5 },
];

export const farmLevelFor = (xp) => {
  const table = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000];
  let level = 1;
  table.forEach((t, i) => { if (xp >= t) level = i + 1; });
  return level;
};

export const energyMaxFor = (xp) => 50 + farmLevelFor(xp) * 10;

export const FARM_ANIMALS = [
  { id: 'galinha', name: 'Galinha', emoji: '🐔', price: 30, xp: 10, level: 1 },
  { id: 'pato', name: 'Pato', emoji: '🦆', price: 45, xp: 15, level: 2 },
  { id: 'ovelha', name: 'Ovelha', emoji: '🐑', price: 60, xp: 20, level: 3 },
  { id: 'vaca', name: 'Vaca', emoji: '🐄', price: 90, xp: 30, level: 4 },
  { id: 'abelha', name: 'Abelha', emoji: '🐝', price: 120, xp: 40, level: 5 },
  { id: 'cavalo', name: 'Cavalo', emoji: '🐎', price: 180, xp: 60, level: 6 },
];

export const FARM_BUILDINGS = [
  { id: 'celeiro', name: 'Celeiro', emoji: '🏚️', price: 150, xp: 40, level: 3 },
  { id: 'silo', name: 'Silo', emoji: '🛖', price: 220, xp: 60, level: 4 },
  { id: 'estufa', name: 'Estufa', emoji: '🏕️', price: 300, xp: 80, level: 5 },
  { id: 'moinho', name: 'Moinho', emoji: '🌀', price: 400, gems: 2, xp: 100, level: 6 },
  { id: 'turbina', name: 'Turbina Eólica', emoji: '⚡', price: 500, gems: 3, xp: 140, level: 7 },
  { id: 'painel_solar', name: 'Painel Solar', emoji: '☀️', price: 450, gems: 3, xp: 130, level: 7 },
  { id: 'oficina', name: 'Oficina', emoji: '🔧', price: 550, gems: 4, xp: 150, level: 8 },
];

export const FARM_DECOR = [
  { id: 'cerca', name: 'Cerca', emoji: '🚧', price: 20, level: 1 },
  { id: 'flor', name: 'Jardim de Flores', emoji: '🌸', price: 60, level: 2 },
  { id: 'lago', name: 'Lago', emoji: '💧', price: 140, level: 3 },
  { id: 'pomar', name: 'Pomar', emoji: '🍎', price: 200, level: 4 },
  { id: 'trator', name: 'Trator', emoji: '🚜', price: 280, gems: 1, level: 5 },
  { id: 'roda_dagua', name: 'Roda d’Água', emoji: '🎡', gems: 2, price: 0, level: 6 },
];

export const FARM_DECOR_THEMED = {
  semana_matematica: '🧮',
  desafio_enem: '🎓',
  gincana_bncc: '🏁',
  olimpiada_escolar: '🏅',
};