import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' às ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const resizeImageToDataUrl = (file, size = 256) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, size / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Imagem inválida'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const gradeLabel = (g) => {
  const map = {
    '1_ano': '1º Ano', '2_ano': '2º Ano', '3_ano': '3º Ano', '4_ano': '4º Ano',
    '5_ano': '5º Ano', '6_ano_fund': '6º Ano', '7_ano_fund': '7º Ano',
    '8_ano_fund': '8º Ano', '9_ano_fund': '9º Ano', '1_medio': '1ª Série Médio',
    '2_medio': '2ª Série Médio', '3_medio': '3ª Série Médio',
  };
  return map[g] || g || '—';
};

export const subjectLabel = (s) => {
  const map = {
    matematica: 'Matemática',
    lingua_portuguesa: 'Língua Portuguesa',
    ciencias: 'Ciências',
    historia: 'História',
    geografia: 'Geografia',
    arte: 'Arte',
    educacao_fisica: 'Educação Física',
    lingua_inglesa: 'Língua Inglesa',
    ensino_religioso: 'Ensino Religioso',
    interdisciplinar: 'Interdisciplinar',
  };
  return map[s] || s || '—';
};

export const difficultyLabel = (d) => {
  const map = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
  return map[d] || d || '—';
};

export const gameModeLabel = (m) => {
  const map = {
    quiz_fases: 'Quiz em Fases',
    desafio_misto: 'Desafio Misto',
    missao_aventura: 'Missão Aventura',
    jogo_memoria: 'Jogo da Memória',
    forca: 'Forca',
    caca_palavras: 'Caça-palavras',
  };
  return map[m] || m || '—';
};

export const roleLabel = (r) => {
  const map = {
    aluno: 'Aluno', professor: 'Professor', direcao: 'Direção',
    secretaria: 'Secretaria', pai: 'Responsável',
  };
  return map[r] || r || '—';
};

export const percent = (value, total) =>
  total === 0 ? 0 : Math.round((value / total) * 100);