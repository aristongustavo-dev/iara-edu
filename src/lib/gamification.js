import { db } from '@/api/db';
import { getUserByEmail } from '@/api/integrations';

// ─── LEVEL THRESHOLDS ────────────────────────────────────────────
// XP needed per level: level N requires N*N*10 XP total
export const xpForLevel = (level) => level * level * 10;
export const levelForXp = (xp) => Math.floor(Math.sqrt(xp / 10)) + 1;

// ─── XP REWARDS TABLE ────────────────────────────────────────────
export const XP_REWARDS = {
  LOGIN_DAILY: 5,
  ACTIVITY_COMPLETE: 20,
  QUESTION_CORRECT: 10,
  QUESTAO_PERFEITA: 30,
  MISSION_COMPLETE: 50,
  STREAK_BONUS: (days) => Math.min(days * 5, 100),
  HARVEST: (cropXp) => cropXp || 10,
  FIRST_LOGIN_TODAY: 10,
};

// ─── COIN REWARDS TABLE ──────────────────────────────────────────
export const COIN_REWARDS = {
  ACTIVITY_COMPLETE: 10,
  QUESTION_CORRECT: 5,
  MISSION_COMPLETE: 25,
  DAILY_LOGIN: 10,
  STREAK_BONUS: (days) => Math.min(days * 3, 50),
  HARVEST: (cropMilhos) => cropMilhos || 10,
};

// ─── WORLD ZONES (for interactive map) ──────────────────────────
export const WORLD_ZONES = [
  { id: 'casa', name: 'Casa do Aluno', icon: '🏡', desc: 'Seu perfil, avatar e conquistas', route: '/Profile', x: 8, y: 55, unlockLevel: 1, color: '#8B5E3C' },
  { id: 'escola', name: 'Escola', icon: '🏫', desc: 'Atividades, aulas e missões', route: '/Activities', x: 30, y: 40, unlockLevel: 1, color: '#4A90D9' },
  { id: 'biblioteca', name: 'Biblioteca', icon: '📚', desc: 'Conteúdos, apostilas e vídeos', route: '/Activities', x: 50, y: 25, unlockLevel: 2, color: '#8B4513' },
  { id: 'laboratorio', name: 'Laboratório', icon: '🔬', desc: 'Experimentos e ciências', route: '/Activities', x: 72, y: 30, unlockLevel: 3, color: '#2ECC71' },
  { id: 'fazenda', name: 'Fazenda Matemática', icon: '🌾', desc: 'Plante, colha e ganhe recompensas', route: '/Farm', x: 25, y: 68, unlockLevel: 1, color: '#DAA520' },
  { id: 'floresta', name: 'Floresta das Ciências', icon: '🌳', desc: 'Explore e descubra', route: '/GameMap', x: 55, y: 60, unlockLevel: 4, color: '#228B22' },
  { id: 'museu', name: 'Museu da História', icon: '🏛️', desc: 'Viaje no tempo', route: '/Activities', x: 82, y: 50, unlockLevel: 5, color: '#CD853F' },
  { id: 'mercado', name: 'Mercado', icon: '🏪', desc: 'Compre itens e decorações', route: '/FarmShop', x: 40, y: 80, unlockLevel: 2, color: '#E67E22' },
  { id: 'praca', name: 'Praça dos Campeões', icon: '🏆', desc: 'Ranking e conquistas', route: '/FarmRanking', x: 70, y: 78, unlockLevel: 3, color: '#F39C12' },
  { id: 'tech', name: 'Centro Tecnológico', icon: '💻', desc: 'Programação e robótica', route: '/Activities', x: 90, y: 35, unlockLevel: 6, color: '#9B59B6' },
];

// ─── ACHIEVEMENTS / BADGES ──────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'primeiro_passo', name: 'Primeiro Passo', icon: '👣', desc: 'Complete sua primeira atividade', condition: (u) => (u.total_activities || 0) >= 1 },
  { id: 'estudante_dedicado', name: 'Estudante Dedicado', icon: '📖', desc: 'Complete 10 atividades', condition: (u) => (u.total_activities || 0) >= 10 },
  { id: 'explorador', name: 'Explorador', icon: '🔍', desc: 'Complete 50 atividades', condition: (u) => (u.total_activities || 0) >= 50 },
  { id: 'mestre_quiz', name: 'Mestre do Quiz', icon: '🧠', desc: 'Acerte 100 questões', condition: (u) => (u.total_correct || 0) >= 100 },
  { id: 'sequencia_3', name: 'Fogo Aceso', icon: '🔥', desc: '3 dias seguidos estudando', condition: (u) => (u.streak_days || 0) >= 3 },
  { id: 'sequencia_7', name: 'Semana Perfeita', icon: '🔥', desc: '7 dias seguidos estudando', condition: (u) => (u.streak_days || 0) >= 7 },
  { id: 'sequencia_30', name: 'Lenda da Constância', icon: '🔥', desc: '30 dias seguidos estudando', condition: (u) => (u.streak_days || 0) >= 30 },
  { id: 'nivel_5', name: 'Explorador Nv.5', icon: '⭐', desc: 'Alcance o nível 5', condition: (u) => (u.level || 1) >= 5 },
  { id: 'nivel_10', name: 'Investigador Nv.10', icon: '🌟', desc: 'Alcance o nível 10', condition: (u) => (u.level || 1) >= 10 },
  { id: 'nivel_20', name: 'Mestre Nv.20', icon: '✨', desc: 'Alcance o nível 20', condition: (u) => (u.level || 1) >= 20 },
  { id: 'agricultor', name: 'Agricultor', icon: '🌾', desc: 'Colha 10 plantações', condition: (u) => (u.farm?.harvest_total || 0) >= 10 },
  { id: 'colecionador', name: 'Colecionador', icon: '🏅', desc: 'Ganhe 5 medalhas', condition: (u) => (u.badges?.length || 0) >= 5 },
  { id: 'mil_xp', name: 'Mil Pontos', icon: '💎', desc: 'Acumule 1000 XP', condition: (u) => (u.xp || 0) >= 1000 },
  { id: 'ricao', name: 'Ricão', icon: '🌽', desc: 'Acumule 500 milhos', condition: (u) => (u.farm?.milhos || 0) >= 500 },
];

// ─── MAIN FUNCTION: AWARD REWARD ─────────────────────────────────
export function awardReward(email, eventType, context = {}) {
  const user = getUserByEmail(email);
  if (!user) return null;

  let xpGain = 0;
  let coinGain = 0;
  let streakBonus = false;
  const badgesEarned = [];

  switch (eventType) {
    case 'LOGIN_DAILY':
      xpGain = XP_REWARDS.FIRST_LOGIN_TODAY;
      coinGain = COIN_REWARDS.DAILY_LOGIN;
      break;
    case 'ACTIVITY_COMPLETE':
      xpGain = XP_REWARDS.ACTIVITY_COMPLETE;
      coinGain = COIN_REWARDS.ACTIVITY_COMPLETE;
      break;
    case 'QUESTION_CORRECT':
      xpGain = XP_REWARDS.QUESTION_CORRECT;
      coinGain = COIN_REWARDS.QUESTION_CORRECT;
      break;
    case 'QUESTAO_PERFEITA':
      xpGain = XP_REWARDS.QUESTAO_PERFEITA;
      coinGain = COIN_REWARDS.QUESTION_CORRECT * 2;
      break;
    case 'MISSION_COMPLETE':
      xpGain = XP_REWARDS.MISSION_COMPLETE;
      coinGain = COIN_REWARDS.MISSION_COMPLETE;
      break;
    case 'HARVEST':
      xpGain = XP_REWARDS.HARVEST(context.cropXp);
      coinGain = COIN_REWARDS.HARVEST(context.cropMilhos);
      break;
    case 'WORLD_COLLECT':
      xpGain = context.extraXp || 10;
      coinGain = context.extraCoins || 1;
      break;
    case 'STREAK_BONUS':
      xpGain = XP_REWARDS.STREAK_BONUS(context.streakDays || 0);
      coinGain = COIN_REWARDS.STREAK_BONUS(context.streakDays || 0);
      streakBonus = true;
      break;
    default:
      break;
  }

  // Apply XP
  const prevLevel = user.level || 1;
  user.xp = (user.xp || 0) + xpGain;
  user.level = levelForXp(user.xp);
  const leveledUp = user.level > prevLevel;

  // Apply coins to user
  user.coins = (user.coins || 0) + coinGain;

  // Apply to character if exists
  const chars = db.get('characters') || [];
  const char = chars.find((c) => c.student_email === email);
  if (char) {
    char.xp = (char.xp || 0) + xpGain;
    char.level = levelForXp(char.xp);
    char.coins = (char.coins || 0) + coinGain;
    db.update('characters', char.id, char);
  }

  // Check achievements
  const userBadges = new Set(user.badges || []);
  ACHIEVEMENTS.forEach((ach) => {
    if (!userBadges.has(ach.id) && ach.condition(user)) {
      userBadges.add(ach.id);
      badgesEarned.push(ach);
    }
  });
  user.badges = [...userBadges];

  // Save user
  db.update('users', user.id, user);

  return {
    xpGain,
    coinGain,
    leveledUp,
    newLevel: user.level,
    streakBonus,
    badgesEarned,
    totalXp: user.xp,
    totalCoins: user.coins,
  };
}

// ─── STREAK MANAGEMENT ──────────────────────────────────────────
export function checkAndUpdateStreak(email) {
  const user = getUserByEmail(email);
  if (!user) return { streak: 0, bonus: false };

  const today = new Date().toISOString().slice(0, 10);
  const lastLogin = user.last_login_date;

  if (lastLogin === today) {
    return { streak: user.streak_days || 0, bonus: false };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastLogin === yesterday) {
    // Consecutive day
    user.streak_days = (user.streak_days || 0) + 1;
  } else if (lastLogin !== today) {
    // Streak broken
    user.streak_days = 1;
  }

  user.last_login_date = today;
  db.update('users', user.id, user);

  return {
    streak: user.streak_days,
    bonus: user.streak_days >= 3,
  };
}

// ─── MISSIONS ────────────────────────────────────────────────────
const DAILY_MISSION_DEFS = [
  { id: 'daily_activity', title: 'Complete uma atividade', desc: 'Resolva qualquer atividade disponível', icon: '📝', xpReward: 25, coinReward: 15, target: 1, type: 'daily', trackField: 'activities_today' },
  { id: 'daily_correct', title: 'Acerte 3 questões', desc: 'Acerte no mínimo 3 questões em atividades', icon: '✅', xpReward: 20, coinReward: 10, target: 3, type: 'daily', trackField: 'correct_today' },
  { id: 'daily_farm', title: 'Colha uma plantação', desc: 'Colha pelo menos 1 planta na fazenda', icon: '🌾', xpReward: 15, coinReward: 10, target: 1, type: 'daily', trackField: 'harvests_today' },
];

const WEEKLY_MISSION_DEFS = [
  { id: 'weekly_5_activities', title: 'Complete 5 atividades', desc: 'Faça 5 atividades nesta semana', icon: '📚', xpReward: 100, coinReward: 50, target: 5, type: 'weekly', trackField: 'activities_week' },
  { id: 'weekly_streak', title: 'Mantenha a sequência', desc: 'Estude 5 dias seguidos', icon: '🔥', xpReward: 75, coinReward: 40, target: 5, type: 'weekly', trackField: 'streak_week' },
  { id: 'weekly_perfect', title: 'Atividade perfeita', desc: 'Gabarite 2 atividades', icon: '⭐', xpReward: 80, coinReward: 30, target: 2, type: 'weekly', trackField: 'perfect_week' },
];

const STORY_MISSIONS = [
  { id: 'story_plant_first', title: 'Plante sua primeira semente', desc: 'Vá até a Fazenda e plante qualquer cultura', icon: '🌱', xpReward: 50, coinReward: 30, target: 1, type: 'story', trackField: 'plant_count', route: '/Farm' },
  { id: 'story_first_activity', title: 'Comece sua jornada', desc: 'Complete sua primeira atividade', icon: '🚀', xpReward: 50, coinReward: 25, target: 1, type: 'story', trackField: 'total_activities', route: '/Activities' },
  { id: 'story_visit_library', title: 'Explore a Biblioteca', desc: 'Visite a Biblioteca pelo menos uma vez', icon: '📖', xpReward: 30, coinReward: 15, target: 1, type: 'story', trackField: 'library_visits' },
  { id: 'story_level_3', title: 'Suba para o nível 3', desc: 'Acumule XP suficiente para o nível 3', icon: '⬆️', xpReward: 80, coinReward: 50, target: 3, type: 'story', trackField: 'level' },
  { id: 'story_buy_seed', title: 'Compre uma semente', desc: 'Visite o Mercado e compre sua primeira semente', icon: '🛒', xpReward: 40, coinReward: 20, target: 1, type: 'story', trackField: 'seeds_bought', route: '/FarmShop' },
  { id: 'story_harvest_5', title: 'Colhendo frutos', desc: 'Colha 5 plantações na Fazenda', icon: '🌾', xpReward: 60, coinReward: 40, target: 5, type: 'story', trackField: 'harvest_total', route: '/Farm' },
];

export function getDailyMissions(email) {
  const progress = db.get('mission_progress') || {};
  const userProg = progress[email] || {};
  const today = new Date().toISOString().slice(0, 10);

  // Reset daily if new day
  if (userProg.last_daily_reset !== today) {
    userProg.daily = {};
    userProg.last_daily_reset = today;
  }

  return DAILY_MISSION_DEFS.map((m) => ({
    ...m,
    progress: userProg.daily?.[m.id] || 0,
    completed: (userProg.daily?.[m.id] || 0) >= m.target,
    claimed: userProg.daily?.[`${m.id}_claimed`] || false,
  }));
}

export function getWeeklyMissions(email) {
  const progress = db.get('mission_progress') || {};
  const userProg = progress[email] || {};
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekKey = weekStart.toISOString().slice(0, 10);

  if (userProg.last_weekly_reset !== weekKey) {
    userProg.weekly = {};
    userProg.last_weekly_reset = weekKey;
  }

  return WEEKLY_MISSION_DEFS.map((m) => ({
    ...m,
    progress: userProg.weekly?.[m.id] || 0,
    completed: (userProg.weekly?.[m.id] || 0) >= m.target,
    claimed: userProg.weekly?.[`${m.id}_claimed`] || false,
  }));
}

export function getStoryMissions(email) {
  const user = getUserByEmail(email);
  if (!user) return [];

  const farm = (db.get('farms') || []).find((f) => f.student_email === email);

  return STORY_MISSIONS.map((m) => {
    let progress = 0;
    switch (m.trackField) {
      case 'total_activities': progress = user.total_activities || 0; break;
      case 'level': progress = user.level || 1; break;
      case 'plant_count': progress = (farm?.crops || []).length + (farm?.harvest_total || 0); break;
      case 'harvest_total': progress = farm?.harvest_total || 0; break;
      default: progress = 0;
    }
    return {
      ...m,
      progress: Math.min(progress, m.target),
      completed: progress >= m.target,
    };
  });
}

export function trackMissionProgress(email, field, amount = 1) {
  const progress = db.get('mission_progress') || {};
  const userProg = progress[email] || {};

  if (!userProg.daily) userProg.daily = {};
  if (!userProg.weekly) userProg.weekly = {};

  // Track daily field
  if (field === 'activities_today' || field === 'correct_today' || field === 'harvests_today') {
    userProg.daily[field] = (userProg.daily[field] || 0) + amount;
  }

  // Track weekly field
  if (field === 'activities_week' || field === 'perfect_week') {
    userProg.weekly[field] = (userProg.weekly[field] || 0) + amount;
  }

  progress[email] = userProg;
  db.update('mission_progress', email, userProg);
}

export function claimMissionReward(email, missionId) {
  const progress = db.get('mission_progress') || {};
  const userProg = progress[email] || {};
  const allMissions = [...getDailyMissions(email), ...getWeeklyMissions(email)];
  const mission = allMissions.find((m) => m.id === missionId);

  if (!mission || !mission.completed) return null;

  const period = mission.type === 'daily' ? 'daily' : 'weekly';
  const claimKey = `${missionId}_claimed`;
  if (userProg[period]?.[claimKey]) return null; // Already claimed

  if (!userProg[period]) userProg[period] = {};
  userProg[period][claimKey] = true;
  progress[email] = userProg;
  db.update('mission_progress', email, userProg);

  // Award rewards
  const user = getUserByEmail(email);
  if (!user) return null;

  user.xp = (user.xp || 0) + mission.xpReward;
  user.level = levelForXp(user.xp);
  user.coins = (user.coins || 0) + mission.coinReward;
  db.update('users', user.id, user);

  return { xpGain: mission.xpGain || mission.xpReward, coinGain: mission.coinReward };
}

// ─── LEVEL-UP UNLOCKS ───────────────────────────────────────────
export function getUnlockedZones(level) {
  return WORLD_ZONES.filter((z) => level >= z.unlockLevel);
}

export function getLockedZones(level) {
  return WORLD_ZONES.filter((z) => level < z.unlockLevel);
}

export function getNextUnlock(level) {
  const locked = WORLD_ZONES.filter((z) => level < z.unlockLevel).sort((a, b) => a.unlockLevel - b.unlockLevel);
  return locked[0] || null;
}

// ─── DAILY LOGIN REWARD ─────────────────────────────────────────
export function processDailyLogin(email) {
  const user = getUserByEmail(email);
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  if (user.last_login_date === today) return { alreadyLoggedIn: true };

  const streakResult = checkAndUpdateStreak(email);
  const reward = awardReward(email, 'LOGIN_DAILY');

  if (streakResult.bonus) {
    const streakReward = awardReward(email, 'STREAK_BONUS', { streakDays: streakResult.streak });
    return { streak: streakResult.streak, reward, streakReward };
  }

  return { streak: streakResult.streak, reward };
}
