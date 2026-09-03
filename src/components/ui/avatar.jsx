import { cn } from '@/lib/utils';

const ROLE_FALLBACK = { aluno: '🦊', professor: '🧑‍🏫', direcao: '🧑‍💼', pai: '👨‍👩‍👧' };

export const Avatar = ({ character, role, emoji, photo, className, gradClass }) => {
  const photoSrc = photo ?? character?.avatar_photo ?? null;
  const inner = emoji ?? character?.avatar_emoji ?? ROLE_FALLBACK[role] ?? '🧑‍🏫';
  return (
    <div
      className={cn(
        'bg-gradient-to-br flex items-center justify-center overflow-hidden shrink-0',
        gradClass || character?.color || 'from-violet-500 to-indigo-500',
        className,
      )}
    >
      {photoSrc ? (
        <img src={photoSrc} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{inner}</span>
      )}
    </div>
  );
};

export default Avatar;