import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44Client } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/metrics';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subjectLabel, difficultyLabel, gradeLabel, gameModeLabel } from '@/lib/utils';
import { Search } from 'lucide-react';

const activityCount = (a) => {
  if (a.game_mode === 'jogo_memoria') return a.game_content?.pairs?.length || 0;
  if (a.game_mode === 'forca' || a.game_mode === 'caca_palavras') return a.game_content?.words?.length || 0;
  return a.questions?.length || 0;
};

const activityPlayLabel = (a) => {
  if (a.game_mode === 'jogo_memoria') return '🃏 Jogar Memória';
  if (a.game_mode === 'forca') return '🎯 Jogar Forca';
  if (a.game_mode === 'caca_palavras') return '🔎 Caça-Palavras';
  if (a.game_mode === 'missao_aventura') return '🚀 Jogar Missão';
  return '▶️ Jogar Quiz';
};

const ActivityProgress = ({ activityId, studentEmail }) => {
  const [progress, setProgress] = useState(null);
  useEffect(() => {
    let active = true;
    base44Client
      .get('attempts', { activity_id: activityId, student_email: studentEmail })
      .then((attempts) => active && setProgress(attempts.length ? Math.round(attempts[0].score) : 0));
    return () => { active = false; };
  }, [activityId, studentEmail]);
  if (progress === null) return null;
  return progress > 0 ? (
    <div className="text-xs text-muted-foreground space-y-1">
      <span>Última tentativa: {progress}%</span>
      <ProgressBar value={progress} />
    </div>
  ) : null;
};

const subjectEmoji = (subject) => (
  { matematica: '🧮', lingua_portuguesa: '📖', ciencias: '🔬', historia: '🏛️', geografia: '🌍', arte: '🎨', educacao_fisica: '⚽', lingua_inglesa: '🇬🇧', ensino_religioso: '🕊️', interdisciplinar: '🎈' }[subject] || '📚'
);

const medalLabel = (m) => ({ bronze: '🥉 Bronze', prata: '🥈 Prata', ouro: '🥇 Ouro' }[m] || m);

const Activities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const isStaff = user?.role === 'professor' || user?.role === 'admin' || user?.role === 'direcao';

  useEffect(() => {
    let active = true;
    base44Client.getAll('activities', 'created_at', 'desc').then((rows) => {
      if (!active) return;
      const owned = isStaff
        ? rows.filter((a) => a.status === 'publicada' || a.created_by_email === user.email)
        : rows.filter((a) => a.status === 'publicada');
      setActivities(owned);
      setLoading(false);
    });
    return () => { active = false; };
  }, [isStaff, user.email]);

  const subjects = useMemo(() => [...new Set(activities.map((a) => a.subject))], [activities]);
  const grades = useMemo(() => [...new Set(activities.map((a) => a.grade_level))], [activities]);

  const filtered = activities.filter((a) => {
    if (subjectFilter !== 'all' && a.subject !== subjectFilter) return false;
    if (gradeFilter !== 'all' && a.grade_level !== gradeFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Atividades" subtitle="Escolha uma aventura e comece a aprender jogando!" icon="🧩" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar atividade..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="sm:w-56">
          <option value="all">Todas as disciplinas</option>
          {subjects.map((s) => <option key={s} value={s}>{subjectLabel(s)}</option>)}
        </Select>
        <Select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="sm:w-48">
          <option value="all">Todas as séries</option>
          {grades.map((g) => <option key={g} value={g}>{gradeLabel(g)}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🗺️" title="Nenhuma atividade encontrada" description="Tente ajustar os filtros ou volte mais tarde." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => (
            <div key={a.id} className="card-playful p-5 flex flex-col gap-3 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl">{subjectEmoji(a.subject)}</span>
                <Badge tone={a.status === 'publicada' ? 'success' : 'warning'}>
                  {a.status === 'publicada' ? 'Publicada' : 'Rascunho'}
                </Badge>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg leading-snug">{a.title}</h3>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{a.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="primary">{gameModeLabel(a.game_mode)}</Badge>
                <Badge tone="neutral">{difficultyLabel(a.difficulty)}</Badge>
                <Badge tone="neutral">{activityCount(a)} {a.game_mode === 'jogo_memoria' ? 'pares' : a.game_mode === 'forca' || a.game_mode === 'caca_palavras' ? 'palavras' : 'questões'}</Badge>
                {a.medal && <Badge tone="warning">{medalLabel(a.medal)}</Badge>}
              </div>
              {!isStaff && (
                <ActivityProgress activityId={a.id} studentEmail={user.email} />
              )}
              <Button className="mt-auto" onClick={() => navigate(`/PlayActivity?id=${a.id}`)}>
                {activityPlayLabel(a)}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Activities;