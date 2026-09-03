import { db } from './db';
import { getOrCreateCharacter, farmLevelFor, energyMaxFor, CROPS, FARM_ANIMALS, FARM_BUILDINGS, FARM_DECOR } from './integrations';

const todayKey = () => new Date().toISOString().slice(0, 10);

export const getOrCreateFarm = (student) => {
  if (!student) return null;
  const existing = db.get('farms', { student_email: student.email })[0];
  if (existing) return existing;
  const farm = db.insert('farms', {
    student_email: student.email,
    student_name: student.name,
    level: 1, xp: 0, milhos: 60, gemas: 0,
    energy: 100, energy_max: 100,
    inventories: { sementes: { milho: 6, trigo: 0, cenoura: 2, alface: 2, cafe: 0, cacau: 0 } },
    crops: [],
    animals: [],
    buildings: [],
    decorations: [],
    harvest_total: 0,
    atividades_concluidas: 0,
    total_questoes: 0,
    missions: [],
    collected_missions: [],
    eventos: [],
    updated_at: todayKey(),
  });
  return farm;
};

export const saveFarm = (farm) => {
  if (!farm?.id) return null;
  const xp = farm.xp || 0;
  const level = farmLevelFor(xp);
  const energyMax = energyMaxFor(xp);
  const patch = {
    ...farm,
    level,
    energy_max: energyMax,
    energy: Math.min(energyMax, farm.energy ?? energyMax),
    updated_at: new Date().toISOString(),
    mission_date: farm.mission_date || todayKey(),
  };
  return db.update('farms', farm.id, patch);
};

export const getFarmFor = (email) => {
  const farm = db.get('farms', { student_email: email })[0];
  if (!farm) return null;
  return { ...farm, level: farmLevelFor(farm.xp || 0), energy_max: energyMaxFor(farm.xp || 0) };
};

const ensureEnergy = (farm) => {
  const max = energyMaxFor(farm.xp || 0);
  const last = (farm.updated_at ? Date.parse(farm.updated_at) : Date.now()) || Date.now();
  const elapsed = Math.max(0, (Date.now() - last) / 1000 / 60);
  const regen = Math.floor(elapsed / 5); // +1 energy a cada 5 min
  return Math.min(max, (farm.energy || 0) + regen);
};

export const plantCrop = (farm, cropId, plotCount = 1) => {
  const cropDef = CROPS.find((c) => c.id === cropId);
  if (!cropDef) return { ok: false, msg: 'Cultura desconhecida' };
  const energy = ensureEnergy(farm);
  const inventory = farm?.inventories?.sementes || {};
  const available = inventory[cropId] || 0;
  if (available < plotCount) return { ok: false, msg: 'Você não tem sementes suficientes' };
  if (energy < plotCount) return { ok: false, msg: 'Energia insuficiente. Descanse um pouco! 😴' };
  const plantedAt = Date.now();
  const crops = [
    ...(farm.crops || []),
    { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, cropId, plantedAt },
  ];
  const patch = {
    crops,
    energy: energy - plotCount,
    inventories: { ...(farm.inventories || {}), sementes: { ...inventory, [cropId]: available - plotCount } },
  };
  saveFarm({ ...farm, ...patch });
  return { ok: true, msg: `${cropDef.emoji} Plantado!`, farm: getFarmFor(farm.student_email) };
};

export const getCrops = () => CROPS;

export const getCatalog = () => ({ crops: CROPS, animals: FARM_ANIMALS, buildings: FARM_BUILDINGS, decor: FARM_DECOR });

export const harvestCrop = async (farm, cropId) => {
  const cropDef = CROPS.find((c) => c.id === cropId);
  if (!cropDef) return { ok: false, msg: 'Cultura desconhecida' };
  const crops = (farm.crops || []).filter((c) => c.id !== cropId);
  const harvest_total = (farm.harvest_total || 0) + 1;
  const xp = (farm.xp || 0) + cropDef.xp;
  // colheita: +milhos e +retorno de semente
  const sementes = { ...(farm.inventories?.sementes || {}) };
  sementes[cropDef.id] = (sementes[cropDef.id] || 0) + 1;
  const patch = {
    crops,
    harvest_total,
    xp,
    milhos: (farm.milhos || 0) + cropDef.xp,
    energy: Math.min(energyMaxFor(xp), ensureEnergy(farm) + 5),
    inventories: { ...(farm.inventories || {}), sementes },
    colheitas_today: (farm.colheitas_today || 0) + 1,
  };
  saveFarm({ ...farm, ...patch });

  // medalha Agricultor (500 colheitas)
  const character = getOrCreateCharacter({ email: farm.student_email, name: farm.student_name });
  if (character) {
    const badges = [...(character.badges || [])];
    if (harvest_total >= 500 && !badges.find((b) => b.name === 'Agricultor')) {
      badges.push({ name: 'Agricultor', icon: '🌽', earned_date: new Date().toISOString() });
    }
    if (badges.length > (character.badges?.length || 0)) {
      db.update('characters', character.id, { badges });
    }
  }

  return { ok: true, msg: `Colheita! +${cropDef.xp} XP e +${cropDef.xp} milhos`, farm: getFarmFor(farm.student_email) };
};

export const buyItem = (farm, category, itemId) => {
  const catalog = category === 'semente' ? CROPS : category === 'animal' ? FARM_ANIMALS : category === 'construcao' ? FARM_BUILDINGS : FARM_DECOR;
  const item = catalog.find((c) => c.id === itemId);
  if (!item) return { ok: false, msg: 'Item desconhecido' };
  const price = item.price || 0;
  const gems = item.gems || 0;
  const milhos = farm.milhos || 0;
  const gemas = farm.gemas || 0;
  if (milhos < price || gemas < gems) return { ok: false, msg: 'Saldo insuficiente' };

  const patch = { milhos: milhos - price, gemas: gemas - gems };

  if (category === 'semente') {
    const sementes = { ...(farm.inventories?.sementes || {}) };
    sementes[itemId] = (sementes[itemId] || 0) + (item.qty || 1);
    patch.inventories = { ...(farm.inventories || {}), sementes };
  } else if (category === 'animal') {
    patch.animals = [...(farm.animals || []), { id: itemId, name: item.name, emoji: item.emoji, boughtAt: Date.now() }];
  } else if (category === 'construcao') {
    patch.buildings = [...(farm.buildings || []), { id: itemId, name: item.name, emoji: item.emoji }];
  } else {
    patch.decorations = [...(farm.decorations || []), { id: itemId, name: item.name, emoji: item.emoji }];
  }
  if (item.xp) patch.xp = (farm.xp || 0) + item.xp;

  saveFarm({ ...farm, ...patch });
  return { ok: true, msg: `${item.emoji} ${item.name} adquirido!`, farm: getFarmFor(farm.student_email) };
};

export const getSementeDefs = () => getCrops();

export const getMissionDefs = () => [
  { id: 'diaria_questoes', name: 'Resolver 8 questões hoje', icon: '📚', target: 8, reward: { milhos: 25, xp: 10 }, key: 'total_questoes' },
  { id: 'diaria_aula', name: 'Assistir 1 aula', icon: '🎬', target: 1, reward: { milhos: 20, xp: 10 }, key: 'atividades_concluidas' },
  { id: 'diaria_colheita', name: 'Colher 3 plantações', icon: '🌽', target: 3, reward: { milhos: 40, xp: 25 }, key: 'colheitas_today' },
  { id: 'diaria_xp', name: 'Ganhar 30 XP hoje', icon: '⚡', target: 30, reward: { milhos: 30, xp: 15 }, key: 'xp_today' },
];

export const getDailyMissions = (farm) => {
  const defs = getMissionDefs();
  const today = todayKey();
  const started = farm?.mission_date === today;
  // progresso: colheitas e atividades de hoje, questões acumuladas do dia
  const progress = {
    total_questoes: farm?.questoes_today || 0,
    atividades_concluidas: farm?.atividades_today || 0,
    colheitas_today: farm?.colheitas_today || 0,
    xp_today: farm?.xp_today || 0,
  };
  const collected = new Set(farm?.collected_missions?.filter((m) => m.date === today).map((m) => m.mission) || []);
  return defs.map((d) => ({
    ...d,
    done: (progress[d.key] || 0) >= d.target,
    collected: collected.has(d.id),
    date: started ? farm.mission_date : today,
    current: progress[d.key] || 0,
  }));
};

export const claimMission = (farm, missionId) => {
  const defs = getMissionDefs();
  const def = defs.find((d) => d.id === missionId);
  if (!def) return { ok: false, msg: 'Missão desconhecida' };
  const collected = farm?.collected_missions || [];
  if (collected.some((m) => m.mission === missionId && m.date === todayKey())) {
    return { ok: false, msg: 'Recompensa já coletada' };
  }
  const prev = getDailyMissions(farm).find((m) => m.id === missionId);
  if (!prev?.done) return { ok: false, msg: 'Missão ainda não concluída' };

  const patch = {
    collected_missions: [...collected, { mission: missionId, date: todayKey(), claimed_at: new Date().toISOString() }],
    milhos: (farm.milhos || 0) + (def.reward.milhos || 0),
    xp: (farm.xp || 0) + (def.reward.xp || 0),
    gemas: (farm.gemas || 0) + (def.reward.gemas || 0),
  };
  saveFarm({ ...farm, ...patch });
  return { ok: true, msg: `Missão concluída! +${def.reward.milhos || 0} milhos`, farm: getFarmFor(farm.student_email) };
};

export const getActiveEvents = () => {
  const nowMs = Date.now();
  return (db.get('events') || []).filter((e) => {
    const start = Date.parse(e.start_date);
    const end = Date.parse(e.end_date);
    if (Number.isNaN(start) || Number.isNaN(end)) return false;
    return nowMs >= start && nowMs <= end;
  });
};

export const getRankings = (user) => {
  const users = db.get('users');
  const students = users.filter((u) => u.role === 'aluno');
  const farmers = students
    .map((s) => {
      const char = db.get('characters', { student_email: s.email })[0];
      const farm = db.get('farms', { student_email: s.email })[0];
      return {
        email: s.email, name: s.name, xp: (char?.xp || s.xp || 0),
        farmXp: farm?.xp || 0, milhos: farm?.milhos || 0,
        farmLevel: farmLevelFor(farm?.xp || 0),
        farmName: farm?.student_name || s.name,
      };
    });

  const classId = user?.class_id;
  const escola = [...farmers].sort((a, b) => b.farmXp - a.farmXp);
  const turma = [...farmers]
    .filter((f) => {
      const u = users.find((x) => x.email === f.email);
      return classId ? u?.class_id === classId : true;
    })
    .sort((a, b) => b.farmXp - a.farmXp);
  const disciplina = [...farmers].sort((a, b) => b.milhos - a.milhos);
  const mes = [...farmers].sort((a, b) => b.xp - a.xp).map((f, i) => ({ ...f, rank: i + 1 }));
  return { escola, turma, disciplina, mes };
};

export const advanceFarmDay = (farm) => {
  // reset progresso diário
  const patch = {
    mission_date: todayKey(),
    colheitas_today: 0,
    atividades_today: 0,
    questoes_today: 0,
    xp_today: 0,
  };
  saveFarm({ ...farm, ...patch });
  return getFarmFor(farm.student_email);
};

export const trackFarmActivity = (farm, { questoes = 0, atividades = 0, xp = 0, colheitas = 0 }) => {
  const today = todayKey();
  const resets = farm?.mission_date !== today;
  saveFarm({
    ...farm,
    mission_date: today,
    questoes_today: (resets ? 0 : farm.questoes_today || 0) + questoes,
    atividades_today: (resets ? 0 : farm.atividades_today || 0) + atividades,
    xp_today: (resets ? 0 : farm.xp_today || 0) + xp,
    colheitas_today: (resets ? 0 : farm.colheitas_today || 0) + colheitas,
  });
  return getFarmFor(farm.student_email);
};