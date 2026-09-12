export const DEMO_ACCOUNTS = [
  { id: 'usr_admin', role: 'direcao', name: 'Diretor Everaldo', email: 'diretor@escola.com', note: 'Direção da escola' },
  { id: 'usr_teacher1', role: 'professor', name: 'Professora Marina', email: 'marina@escola.com', note: 'Matemática e Ciências' },
  { id: 'usr_teacher2', role: 'professor', name: 'Professor Carlos', email: 'carlos@escola.com', note: 'Português e História' },
  { id: 'usr_stud1', role: 'aluno', name: 'Joãozinho', email: 'joao@escola.com', note: '6º Ano A' },
  { id: 'usr_stud2', role: 'aluno', name: 'Ana Beatriz', email: 'ana@escola.com', note: '6º Ano A' },
  { id: 'usr_stud3', role: 'aluno', name: 'Pedro Lucas', email: 'pedro@escola.com', note: '6º Ano A' },
  { id: 'usr_parent', role: 'pai', name: 'Sr. Roberto', email: 'roberto@familia.com', note: 'Pai do Joãozinho' },
];

export const isDemoEmail = (email) =>
  DEMO_ACCOUNTS.some((a) => a.email === String(email || '').trim().toLowerCase());