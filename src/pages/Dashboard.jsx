import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, xpToLevel } from '@/api/integrations';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { StatCard, ProgressBar } from '@/components/ui/metrics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { subjectLabel } from '@/lib/utils';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(getDashboardStats());
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const subjects = Object.entries(stats.bySubject || {});

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Visão geral da escola" icon="📈" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Alunos" value={stats.studentsCount} icon="🎒" tone="primary" />
        <StatCard label="Professores" value={stats.teachersCount} icon="🧑‍🏫" tone="info" />
        <StatCard label="Turmas" value={stats.classesCount} icon="🏫" tone="success" />
        <StatCard label="XP entregue" value={stats.totalXp} icon="⚡" tone="warning" sub={`${stats.attemptsCount} tentativas`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-playful p-5 lg:col-span-2 space-y-4">
          <h3 className="font-heading font-bold text-lg">Aproveitamento por disciplina</h3>
          {subjects.length === 0 ? (
            <EmptyState icon="🧮" title="Sem dados ainda" description="As atividades jogadas aparecerão aqui." />
          ) : (
            subjects.map(([subject, data]) => {
              const acc = data.total ? Math.round((data.correct / data.total) * 100) : 0;
              return (
                <div key={subject} className="flex items-center gap-3">
                  <span className="font-bold text-sm w-40 truncate">{subjectLabel(subject)}</span>
                  <ProgressBar value={acc} className="flex-1" />
                  <span className="text-sm font-bold w-12 text-right">{acc}%</span>
                </div>
              );
            })
          )}
        </div>

        <div className="card-playful p-5">
          <h3 className="font-heading font-bold text-lg mb-3">🏆 Destaques da escola</h3>
          {stats.topStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum aluno com XP ainda.</p>
          ) : (
            <div className="space-y-3">
              {stats.topStudents.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                  <span className="font-display font-bold text-lg w-6">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                  <Avatar character={s.character} role="aluno" className="w-9 h-9 rounded-full text-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Nv {s.character?.level || xpToLevel(s.xp || 0)}</p>
                  </div>
                  <Badge tone="warning">{s.xp || 0} XP</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-playful p-5">
          <h3 className="font-heading font-bold text-lg mb-3">🚩 Habilidades a reforçar (BNCC)</h3>
          {Object.keys(stats.weak || {}).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma habilidade frágil identificada. Que ótimo!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.weak).map(([skill, count]) => (
                <Badge key={skill} tone="warning">{skill} ({count})</Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">A Iara sinaliza automaticamente os conteúdos com mais erros dos alunos.</p>
        </div>

        <div className="card-playful p-5 flex flex-col items-start gap-4">
          <h3 className="font-heading font-bold text-lg">Ações rápidas</h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/ActivityManager"><Button size="sm" variant="outline">✏️ Nova atividade</Button></Link>
            <Link to="/Classes"><Button size="sm" variant="outline">🏫 Gerenciar turmas</Button></Link>
            <Link to="/Attendance"><Button size="sm" variant="outline">📅 Lançar frequência</Button></Link>
            <Link to="/Reports"><Button size="sm" variant="outline">📊 Gerar relatório</Button></Link>
            <Link to="/Mural"><Button size="sm" variant="outline">📌 Publicar aviso</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;