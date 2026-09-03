import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { roleLabel } from '@/lib/utils';
import { base44Client } from '@/api/base44Client';

const cnt = async (collection) => (await base44Client.getAll(collection)).length;

const PainelUsuario = () => {
  const { user, character } = useAuth();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    Promise.all([cnt('activities'), cnt('attempts'), cnt('groups'), cnt('notices')]).then(([a, t, g, n]) => {
      setCounts({ activities: a, attempts: t, groups: g, notices: n });
    });
  }, []);

  if (!user) return null;
  const staff = user.role === 'professor' || user.role === 'admin' || user.role === 'direcao' || user.role === 'secretaria';

  const tiles = staff ? [
    { to: '/Dashboard', icon: '📈', label: 'Dashboard', desc: 'Visão geral da escola' },
    { to: '/ActivityManager', icon: '🧰', label: 'Gerenciar atividades', desc: 'Crie e publique conteúdos' },
    { to: '/Attendance', icon: '📅', label: 'Frequência', desc: 'Lance presença das turmas' },
    { to: '/Reports', icon: '📊', label: 'Relatórios', desc: 'Gere relatórios pedagógicos' },
    { to: '/Classes', icon: '🏫', label: 'Turmas', desc: 'Organize alunos' },
    { to: '/Mural', icon: '📌', label: 'Mural', desc: 'Publique avisos' },
  ] : [
    { to: '/Activities', icon: '🧩', label: 'Atividades', desc: 'Jogue e ganhe XP' },
    { to: '/GameMap', icon: '🏡', label: 'Minha fazenda', desc: 'Plante e colha' },
    { to: '/Medals', icon: '🏅', label: 'Conquistas', desc: 'Colecione medalhas' },
    { to: '/MyReport', icon: '📊', label: 'Meu relatório', desc: 'Veja sua evolução' },
    { to: '/CharacterCreation', icon: '🦸', label: 'Meu avatar', desc: 'Personalize seu herói' },
    { to: '/Mural', icon: '📌', label: 'Mural', desc: 'Leia os avisos' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Painel" subtitle="Acesso rápido para tudo no IARA EDU" icon="🎛️" />

      <div className="card-playful p-5 flex items-center gap-4">
        <Avatar character={character} role={user.role} className="w-16 h-16 rounded-2xl text-3xl" />
        <div className="flex-1">
          <p className="font-heading font-bold text-xl">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex gap-2 mt-1.5">
            <Badge tone="primary">{roleLabel(user.role)}</Badge>
            <Badge tone="neutral">{user.school_name || 'Sem escola'}</Badge>
          </div>
        </div>
        <div className="hidden sm:flex gap-3 text-center">
          <div className="rounded-2xl bg-muted/60 px-4 py-2">
            <p className="font-bold">{counts.attempts ?? '—'}</p>
            <p className="text-[10px] text-muted-foreground">Tentativas</p>
          </div>
          <div className="rounded-2xl bg-muted/60 px-4 py-2">
            <p className="font-bold">{counts.activities ?? '—'}</p>
            <p className="text-[10px] text-muted-foreground">Atividades</p>
          </div>
          <div className="rounded-2xl bg-muted/60 px-4 py-2">
            <p className="font-bold">{counts.groups ?? '—'}</p>
            <p className="text-[10px] text-muted-foreground">Grupos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="card-playful p-5 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg">
            <span className="text-3xl">{t.icon}</span>
            <div>
              <h3 className="font-heading font-bold">{t.label}</h3>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PainelUsuario;