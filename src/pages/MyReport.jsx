import React, { useState, useEffect } from 'react';
import { base44Client } from '@/api/base44Client';
import { getStudentReportData, attendanceRateForClass } from '@/api/integrations';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { StatCard, ProgressBar } from '@/components/ui/metrics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table';
import { subjectLabel, formatDate } from '@/lib/utils';

const MyReport = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = getStudentReportData(user.email);
      const att = await base44Client.get('attendances');
      if (!active) return;
      setReport(data);
      setAttempts(data.attempts.slice(0, 10));
      const rate = user.role === 'aluno' ? attendanceRateForClass(user.class_id) : 100;
      setAttendance(att.length ? rate : 100);
    };
    if (user) load();
    return () => { active = false; };
  }, [user]);

  if (!report) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const subjects = Object.entries(report.bySubject || {});

  return (
    <div className="space-y-6">
      <PageHeader title="Meu Relatório" subtitle={`Acompanhe seu desempenho, ${user?.name}!`} icon="📊" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Aproveitamento geral" value={`${report.accuracy}%`} icon="🎯" tone="primary" />
        <StatCard label="Pontos de XP" value={report.xp} icon="⚡" tone="warning" sub={`${report.total} atividades`} />
        <StatCard label="Acertos" value={report.correct} icon="✅" tone="success" sub={`em ${report.questions} questões`} />
        <StatCard label="Frequência" value={`${attendance}%`} icon="📅" tone="info" />
      </div>

      {subjects.length > 0 && (
        <div className="card-playful p-5 space-y-4">
          <h3 className="font-heading font-bold text-lg">Desempenho por disciplina</h3>
          {subjects.map(([subject, data]) => {
            const acc = data.total ? Math.round((data.correct / data.total) * 100) : 0;
            return (
              <div key={subject} className="flex items-center gap-4">
                <Badge tone="neutral" className="w-44 justify-start overflow-hidden whitespace-nowrap">{subjectLabel(subject)}</Badge>
                <div className="flex-1"><ProgressBar value={acc} /></div>
                <span className="text-sm font-bold w-20 text-right">{acc}%</span>
              </div>
            );
          })}
        </div>
      )}

      {report.weakSkills.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <h3 className="font-heading font-bold text-lg text-amber-800">💡 Pontos para reforçar</h3>
          <p className="text-sm text-amber-700 mt-1">
            A Iara sugere revisar as habilidades: <b>{report.weakSkills.join(', ')}</b>. Tente refazer as atividades para conquistar os selos dourados!
          </p>
        </div>
      )}

      {attempts.length === 0 ? (
        <EmptyState icon="🗂️" title="Nenhuma tentativa ainda" description="Complete sua primeira atividade para ver seu relatório.">
          <Button onClick={() => (window.location.href = '/Activities')}>Ver atividades</Button>
        </EmptyState>
      ) : (
        <Table>
          <THead>
            <TH>Atividade</TH>
            <TH>Disciplina</TH>
            <TH>Acerto</TH>
            <TH>XP</TH>
            <TH>Data</TH>
          </THead>
          <TBody>
            {attempts.map((a) => (
              <TR key={a.id}>
                <TD className="font-semibold text-foreground">{a.activity_title}</TD>
                <TD>{subjectLabel(a.subject)}</TD>
                <TD>
                  <Badge tone={a.score >= 70 ? 'success' : 'warning'}>{a.score}%</Badge>
                </TD>
                <TD className="font-bold text-amber-600">+{a.xp_earned}</TD>
                <TD>{formatDate(a.submitted_at)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
};

export default MyReport;