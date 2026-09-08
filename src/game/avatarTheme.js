const THEMES = {
  '🦊': { shirt: '#E8823A', pants: '#5D4037', hair: '#D2691E', skin: '#FFD5B4' },
  '🐯': { shirt: '#F9A825', pants: '#3E2723', hair: '#4E342E', skin: '#FFD5B4' },
  '🐼': { shirt: '#333333', pants: '#1A1A1A', hair: '#2B2B2B', skin: '#FFD5B4' },
  '🐸': { shirt: '#43A047', pants: '#2E7D32', hair: '#1B5E20', skin: '#C8E6C9' },
  '🐨': { shirt: '#78909C', pants: '#455A64', hair: '#37474F', skin: '#FFD5B4' },
  '🦁': { shirt: '#F9A825', pants: '#5D4037', hair: '#6D4C41', skin: '#FFD5B4' },
  '🦄': { shirt: '#E891D8', pants: '#7E57C2', hair: '#FFD700', skin: '#FFD5B4' },
  '🐶': { shirt: '#8D6E63', pants: '#4E342E', hair: '#5D4037', skin: '#FFD5B4' },
  '🐱': { shirt: '#E57373', pants: '#37474F', hair: '#4E342E', skin: '#FFD5B4' },
  '🦉': { shirt: '#6D4C41', pants: '#3E2723', hair: '#D7CCC8', skin: '#FFD5B4' },
  '🐳': { shirt: '#4FC3F7', pants: '#1565C0', hair: '#0288D1', skin: '#E1F5FE' },
  '🤖': { shirt: '#90CAF9', pants: '#37474F', hair: '#546E7A', skin: '#E0E0E0' },
  '👧': { shirt: '#F48FB1', pants: '#5D4037', hair: '#8D5524', skin: '#FFD5B4' },
  '🧒': { shirt: '#81C784', pants: '#37474F', hair: '#4E342E', skin: '#F0C8A0' },
  '👦': { shirt: '#64B5F6', pants: '#37474F', hair: '#2B2B2B', skin: '#FFD5B4' },
  '👩': { shirt: '#CE93D8', pants: '#37474F', hair: '#4E342E', skin: '#F0C8A0' },
  '🧑': { shirt: '#A5D6A7', pants: '#37474F', hair: '#3E2723', skin: '#D9A066' },
  '👨': { shirt: '#90A4AE', pants: '#263238', hair: '#1A1A1A', skin: '#C68642' },
};

const PALETTES = {
  shirt: ['#4A90D9', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6', '#00BCD4', '#E84393', '#26A69A'],
  pants: ['#2E3A4B', '#5D4037', '#37474F', '#202020', '#6A1B9A', '#1565C0'],
  hair: ['#2B2B2B', '#4E342E', '#5D4037', '#1A1A1A', '#804E24', '#6D4C41'],
  skin: ['#FFD5B4', '#F0C8A0', '#D9A066', '#C68642', '#8D5524'],
};

const hash = (s) => {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

export const avatarThemeFor = (character, fallback = 'iara') => {
  const emoji = character?.avatar_emoji || fallback;
  const named = THEMES[emoji];
  if (named) return named;
  const h = hash(emoji);
  return {
    shirt: PALETTES.shirt[h % PALETTES.shirt.length],
    pants: PALETTES.pants[(h >>> 3) % PALETTES.pants.length],
    hair: PALETTES.hair[(h >>> 5) % PALETTES.hair.length],
    skin: PALETTES.skin[(h >>> 7) % PALETTES.skin.length],
  };
};