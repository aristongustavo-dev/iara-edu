import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44Client } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, Field } from '@/components/ui/input';
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table';
import { toast } from '@/components/ui/toaster';
import { generateReport } from '@/api/integrations';
import { formatDate } from '@/lib/utils';

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [reportType, setReportType] = useState('individual');
  const [target, setTarget] = useState('');
  const [classId, setClassId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [view, setView] = useState(null);

  const load = () => {
    Promise.all([
      base44Client.get('users', { role: 'aluno' }),
      base44Client.getAll('classes', 'name', 'asc'),
      base44Client.getAll('reports', 'created_at', 'desc'),
    ]).then(([s, c, r]) => {
      setStudents(s);
      setClasses(c);
      setReports(r);
      if (s.length) setTarget((prev) => prev || s[0].email);
      if (c.length) setClassId((prev) => prev || c[0].id);
    });
  };

  useEffect(load, []);

  const generate = async () => {
    setGenerating(true);
    const report = await generateReport({
      type: reportType,
      subject: reportType === 'turma' ? { classId } : { email: target },
      generatedBy: user,
    });
    setGenerating(false);
    if (!report) {
      toast.error('Nada para reportar', 'Não há dados para a seleção escolhida.');
      return;
    }
    toast.success('Relatório gerado!', report.title);
    setView(report);
    load();
  };

  const reportTypeLabel = (t) => ({
    desempenho_individual: 'Individual',
    desempenho_turma: 'Turma',
    evolucao: 'Evolução',
    frequencia: 'Frequência',
  }[t] || t);

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" subtitle="Gere relatórios pedagógicos com a ajuda da Iara" icon="📊" />

      <div className="card-playful p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Field label="Tipo de relatório">
            <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="individual">Desempenho individual</option>
              <option value="turma">Desempenho da turma</option>
            </Select>
          </Field>
          {reportType === 'individual' ? (
            <Field label="Aluno">
              <Select value={target} onChange={(e) => setTarget(e.target.value)}>
                {students.map((s) => <option key={s.id} value={s.email}>{s.name}</option>)}
              </Select>
            </Field>
          ) : (
            <Field label="Turma">
              <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
          )}
          <Button onClick={generate} disabled={generating}>
            {generating ? 'Gerando…' : '🤖 Gerar com a Iara'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          A Iara analisa os jogos, acertos e frequência para escrever um relatório pedagógico resumido.
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState icon="🗂️" title="Nenhum relatório gerado" description="Use o gerador acima para criar o primeiro relatório.">
          <Button onClick={generate} disabled={generating}>Gerar relatório</Button>
        </EmptyState>
      ) : (
        <Table>
          <THead>
            <TH>Relatório</TH>
            <TH>Tipo</TH>
            <TH>Aproveitamento</TH>
            <TH>XP</TH>
            <TH>Tentativas</TH>
            <TH>Data</TH>
            <TH />
          </THead>
          <TBody>
            {reports.map((r) => (
              <TR key={r.id}>
                <TD className="font-semibold text-foreground">{r.title}</TD>
                <TD><Badge tone="secondary">{reportTypeLabel(r.report_type)}</Badge></TD>
                <TD><Badge tone={r.summary?.accuracy >= 70 ? 'success' : 'warning'}>{r.summary?.accuracy || 0}%</Badge></TD>
                <TD className="font-bold text-amber-600">{r.summary?.xp || 0}</TD>
                <TD>{r.summary?.attempts || 0}</TD>
                <TD>{formatDate(r.created_at)}</TD>
                <TD><Button size="sm" variant="outline" onClick={() => setView(r)}>Ver</Button></TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setView(null)} />
          <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-pop-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-heading font-bold text-lg">{view.title}</h2>
              <button onClick={() => setView(null)} className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-muted">✕</button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-center">
                  <p className="font-bold text-primary">{view.summary?.accuracy || 0}%</p>
                  <p className="text-[10px] text-muted-foreground">Acerto</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-center">
                  <p className="font-bold text-amber-600">{view.summary?.xp || 0}</p>
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-3 text-center">
                  <p className="font-bold text-sky-600">{view.summary?.attempts || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Tentativas</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                  <p className="font-bold text-emerald-600">{view.summary?.attendance_rate || 0}%</p>
                  <p className="text-[10px] text-muted-foreground">Frequência</p>
                </div>
              </div>
              <div className="rounded-2xl bg-muted/50 p-4 whitespace-pre-wrap text-sm leading-relaxed">
                {view.content}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Período: {formatDate(view.period_start)} — {formatDate(view.period_end)}</span>
                <span>{view.student_name || view.class_id || ''}</span>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setView(null)}>Fechar</Button>
              <Button onClick={() => navigate(reportType === 'turma' ? '/Users' : '/MyReport')}>Ver na página</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;