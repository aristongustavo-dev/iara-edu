import { gradeLabel, subjectLabel, difficultyLabel, gameModeLabel, roleLabel } from '@/lib/utils';

export const entities = {
  User: {
    collection: 'users',
    label: 'Usuários',
    fields: [
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Perfil', render: roleLabel },
      { key: 'school_name', label: 'Escola' },
      { key: 'grade_level', label: 'Série', render: gradeLabel },
    ],
  },
  Activity: {
    collection: 'activities',
    label: 'Atividades',
    fields: [
      { key: 'title', label: 'Título' },
      { key: 'subject', label: 'Disciplina', render: subjectLabel },
      { key: 'grade_level', label: 'Série', render: gradeLabel },
      { key: 'difficulty', label: 'Dificuldade', render: difficultyLabel },
      { key: 'game_mode', label: 'Modo', render: gameModeLabel },
      { key: 'status', label: 'Status' },
    ],
  },
  Attempt: { collection: 'attempts', label: 'Tentativas', fields: [] },
  Attendance: { collection: 'attendances', label: 'Frequências', fields: [] },
  Character: { collection: 'characters', label: 'Personagens', fields: [] },
  Class: { collection: 'classes', label: 'Turmas', fields: [] },
  Conversation: { collection: 'conversations', label: 'Conversas', fields: [] },
  Group: { collection: 'groups', label: 'Grupos', fields: [] },
  Notice: { collection: 'notices', label: 'Avisos', fields: [] },
  Report: { collection: 'reports', label: 'Relatórios', fields: [] },
};