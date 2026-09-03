import React, { useState, useEffect, useRef } from 'react';
import { base44Client } from '@/api/base44Client';
import { getOrCreateCharacter, PROFESSIONS, AVATARS, AVATAR_COLORS } from '@/api/integrations';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/toaster';
import { cn, resizeImageToDataUrl } from '@/lib/utils';

const CharacterCreation = () => {
  const { user } = useAuth();
  const [character, setCharacter] = useState(null);
  const [profession, setProfession] = useState(null);
  const [avatar, setAvatar] = useState('🦊');
  const [photo, setPhoto] = useState(null);
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [busyPhoto, setBusyPhoto] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const c = getOrCreateCharacter(user);
    setCharacter(c);
    setProfession(c.profession);
    setAvatar(c.avatar_emoji || '🦊');
    setPhoto(c.avatar_photo || null);
    setColor(c.color || AVATAR_COLORS[0]);
  }, [user.email]);

  const save = async () => {
    const prof = PROFESSIONS.find((p) => p.id === profession) || PROFESSIONS[0];
    setSaving(true);
    await base44Client.put('characters', character.id, {
      profession: prof.id,
      profession_label: prof.label,
      avatar_emoji: avatar,
      avatar_photo: photo,
      color,
    });
    setSaving(false);
    toast.success('Avatar atualizado!', 'Seu personagem foi salvo com sucesso. 🌟');
  };

  const pickPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusyPhoto(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 256);
      setPhoto(dataUrl);
    } catch (err) {
      toast.error('Não foi possível carregar a foto', 'Tente outra imagem.');
    } finally {
      setBusyPhoto(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Meu Avatar" subtitle="Monte seu personagem e descubra sua futura profissão!" icon="🦸" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="card-playful lg:col-span-1 p-6 flex flex-col items-center gap-5">
          <Avatar
            character={{ ...character, avatar_photo: photo }}
            emoji={avatar}
            className="w-36 h-36 rounded-3xl text-7xl shadow-lg animate-bounce-soft"
            gradClass={color}
          />
          <div className="text-center">
            <p className="text-2xl font-display font-bold">{user?.name}</p>
            <p className="text-muted-foreground">{PROFESSIONS.find((p) => p.id === profession)?.label || 'Aventureiro'}</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl bg-primary/10 px-3 py-2 text-center">
              <p className="font-bold text-primary">Nv {character?.level || 1}</p>
              <p className="text-[10px] text-muted-foreground">Nível</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-3 py-2 text-center">
              <p className="font-bold text-amber-600">{character?.coins || 0}</p>
              <p className="text-[10px] text-muted-foreground">🪙 Moedas</p>
            </div>
            <div className="rounded-2xl bg-rose-50 px-3 py-2 text-center">
              <p className="font-bold text-rose-500">{character?.stars || 0}</p>
              <p className="text-[10px] text-muted-foreground">⭐ Estrelas</p>
            </div>
          </div>
          <Button className="w-full" disabled={saving} onClick={save}>
            {saving ? 'Salvando…' : 'Salvar avatar'}
          </Button>
        </div>

        {/* Options */}
        <div className="lg:col-span-2 space-y-6">
          <section className="card-playful p-5">
            <h3 className="font-heading font-bold text-lg mb-1">Escolha sua foto 👩‍🦰👨‍🦱</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Use uma foto sua ou escolha uma figura abaixo como mascote.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickPhoto}
                id="avatar-photo-input"
              />
              <label
                htmlFor="avatar-photo-input"
                className={cn(
                  'inline-flex items-center gap-2 font-bold transition-all h-10 px-5 text-sm rounded-xl cursor-pointer select-none',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                📷 {busyPhoto ? 'Carregando…' : 'Enviar minha foto'}
              </label>
              {photo && (
                <button
                  onClick={() => setPhoto(null)}
                  className="inline-flex items-center gap-2 font-bold transition-all h-10 px-5 text-sm rounded-xl bg-muted text-foreground hover:bg-muted/70 cursor-pointer"
                >
                  🗑️ Remover foto
                </button>
              )}
              <span className="text-xs text-muted-foreground">Vale selfie ou avatar gerado com IA.</span>
            </div>
          </section>

          <section className="card-playful p-5">
            <h3 className="font-heading font-bold text-lg mb-4">Ou escolha seu mascote</h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => { setAvatar(a); setPhoto(null); }}
                  className={cn(
                    'aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl transition-all hover:-translate-y-0.5',
                    avatar === a && !photo ? 'border-primary bg-primary/10 scale-110' : 'border-border',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              São {AVATARS.length} mascotes para escolher! 🎉
            </p>
          </section>

          <section className="card-playful p-5">
            <h3 className="font-heading font-bold text-lg mb-4">Qual será sua profissão dos sonhos?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PROFESSIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProfession(p.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all hover:-translate-y-0.5',
                    profession === p.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="text-xs font-bold text-center leading-tight">{p.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card-playful p-5">
            <h3 className="font-heading font-bold text-lg mb-4">Cor do visual</h3>
            <div className="flex flex-wrap gap-3">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-14 h-14 rounded-2xl bg-gradient-to-br transition-all',
                    c,
                    color === c ? 'ring-4 ring-primary/40 scale-110' : 'ring-2 ring-transparent',
                  )}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;