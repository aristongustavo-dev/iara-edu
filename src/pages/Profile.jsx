import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { StatCard, ProgressBar } from '@/components/ui/metrics';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { roleLabel, subjectLabel, gradeLabel, formatDate } from '@/lib/utils';
import { levelBounds } from '@/api/integrations';

const Profile = () => {
  const { user, character } = useAuth();

  if (!user) return null;
  const xp = character?.xp ?? user.xp ?? 0;
  const { level, progress } = levelBounds(xp);

  return (
    <div className="space-y-6">
      <PageHeader title="Meu Perfil" subtitle="Seus dados e evolução na plataforma" icon="👤" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-playful lg:col-span-1 p-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar character={character} role={user.role} className="w-28 h-28 rounded-3xl text-6xl shadow-lg" />
            <div className="text-center">
              <h3 className="font-heading font-bold text-2xl">{user.name}</h3>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <div className="flex justify-center gap-2 mt-2">
                <Badge tone="primary">{roleLabel(user.role)}</Badge>
                {user.school_name && <Badge tone="neutral">{user.school_name}</Badge>}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>Nível {level}</span>
                <span className="text-muted-foreground">{xp} XP</span>
              </div>
              <ProgressBar value={progress} />
            </div>
            {user.role === 'aluno' && character && (
              <p className="text-sm text-muted-foreground">
                Profissão dos sonhos: <b>{character.profession_label}</b>
              </p>
            )}
            {user.role === 'professor' && user.subjects?.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Disciplinas: {user.subjects.map(subjectLabel).join(', ')}
              </p>
            )}
            {user.role === 'pai' && (
              <p className="text-sm text-muted-foreground">
                Responsável por: <b>{user.child_email}</b>
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {user.role === 'aluno' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Atividades" value={user.total_activities || 0} icon="🎮" tone="primary" />
              <StatCard label="Acertos" value={user.total_correct || 0} icon="✅" tone="success" />
              <StatCard label="Sequência" value={`${user.streak_days || 0} dias`} icon="🔥" tone="warning" />
              <StatCard label="Medalhas" value={user.badges?.length || 0} icon="🏅" tone="rose" />
            </div>
          )}

          <div className="card-playful p-5">
            <h3 className="font-heading font-bold text-lg mb-3">🏅 Minhas conquistas recentes</h3>
            {user.badges?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.badges.slice(0, 6).map((b) => (
                  <div key={`${b.name}${b.earned_date}`} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <p className="text-sm font-bold">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(b.earned_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Complete atividades para ganhar medalhas! </p>
            )}
          </div>

          <div className="card-playful p-5">
            <h3 className="font-heading font-bold text-lg mb-3">Detalhes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Série</p>
                <p className="font-bold">{gradeLabel(user.grade_level)}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Escola</p>
                <p className="font-bold">{user.school_name || '—'}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Responsável vinculado</p>
                <p className="font-bold">{user.parent_email || '—'}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Turma</p>
                <p className="font-bold">{user.class_id || '—'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {user.role === 'aluno' && (
              <Button variant="outline" onClick={() => (window.location.href = '/CharacterCreation')}>
                🦸 Personalizar avatar
              </Button>
            )}
            <Button variant="primary" onClick={() => (window.location.href = user.role === 'aluno' ? '/MyReport' : '/Dashboard')}>
              Ver meus relatórios
            </Button>
            <Link to="/Medals" className="inline-flex items-center justify-center gap-2 font-bold transition-all hover:-translate-y-0.5 h-10 px-6 text-sm rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border">
              🏅 Ver conquistas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;