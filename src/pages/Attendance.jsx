import React, { useState, useEffect } from 'react';
import { base44Client } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, Field } from '@/components/ui/input';
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table';
import { toast } from '@/components/ui/toaster';
import { formatDate } from '@/lib/utils';
import { attendanceRateForClass } from '@/api/integrations';

const todayISO = () => new Date().toISOString().slice(0, 10);

const Attendance = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [present, setPresent] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const loadClasses = async () => {
    const rows = await base44Client.getAll('classes', 'name', 'asc');
    setClasses(rows);
    if (rows.length) setClassId((prev) => prev || rows[0].id);
  };

  useEffect(() => { loadClasses(); }, []);

  useEffect(() => {
    if (!classId) return;
    let active = true;
    (async () => {
      const [usrs, att] = await Promise.all([
        base44Client.get('users', { role: 'aluno' }),
        base44Client.get('attendances', { class_id: classId }),
      ]);
      if (!active) return;
      const cls = classes.find((c) => c.id === classId);
      const classStudents = usrs.filter((s) => cls?.student_emails?.includes(s.email));
      setStudents(classStudents);
      setRecords(att);
      const existing = att.find((r) => r.date === date);
      if (existing) {
        setPresent(new Set(existing.present_emails));
      } else {
        setPresent(new Set(classStudents.map((s) => s.email)));
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [classId, date]);

  const toggle = (email) => {
    setPresent((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const save = async () => {
    if (!classId) return;
    const cls = classes.find((c) => c.id === classId);
    const all = new Set(students.map((s) => s.email));
    const absent = students.map((s) => s.email).filter((e) => !present.has(e));
    const existing = records.find((r) => r.date === date);
    const payload = {
      class_id: classId, class_name: cls?.name || '', date,
      present_emails: students.filter((s) => present.has(s.email)).map((s) => s.email),
      absent_emails: absent,
      recorded_by_email: user.email, notes: '',
    };
    if (existing) {
      await base44Client.put('attendances', existing.id, payload);
      toast.success('Frequência atualizada!', `${cls?.name} • ${formatDate(date)}`);
    } else {
      await base44Client.post('attendances', payload);
      toast.success('Frequência lançada!', `${cls?.name} • ${formatDate(date)}`);
    }
    const refreshed = await base44Client.get('attendances', { class_id: classId });
    setRecords(refreshed);
    const sorted = [...refreshed].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7);
    setHistory(sorted);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const rate = attendanceRateForClass(classId);

  return (
    <div className="space-y-6">
      <PageHeader title="Frequência" subtitle="Marque presença dos alunos da turma" icon="📅" />

      <div className="card-playful p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Field label="Turma">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Data">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-10 rounded-xl border border-input bg-card px-3 text-sm" />
          </Field>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}>Salvar frequência</Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge tone="success">{present.size} presentes</Badge>
          <Badge tone="destructive">{students.length - present.size} ausentes</Badge>
          <Badge tone="primary">Média da turma: {rate}%</Badge>
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState icon="👥" title="Turma sem alunos" description="Adicione alunos à turma na página de Turmas." />
      ) : (
        <Table>
          <THead>
            <TH>Aluno</TH>
            <TH>Status</TH>
            <TH />
          </THead>
          <TBody>
            {students.map((s) => (
              <TR key={s.id}>
                <TD className="font-semibold text-foreground">{s.name}</TD>
                <TD>
                  {present.has(s.email) ? (
                    <Badge tone="success">✓ Presente</Badge>
                  ) : (
                    <Badge tone="destructive">✗ Ausente</Badge>
                  )}
                </TD>
                <TD>
                  <button
                    onClick={() => toggle(s.email)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors ${
                      present.has(s.email)
                        ? 'border-emerald-400 text-emerald-600 hover:bg-emerald-50'
                        : 'border-destructive/40 text-destructive hover:bg-destructive/5'
                    }`}
                  >
                    {present.has(s.email) ? 'Marcar ausente' : 'Marcar presente'}
                  </button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {history.length > 0 && (
        <div className="card-playful p-5">
          <h3 className="font-heading font-bold text-lg mb-3">Últimos registros</h3>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <div key={h.id} className="rounded-xl bg-muted/50 px-3 py-2 text-xs">
                <p className="font-bold">{formatDate(h.date)}</p>
                <p className="text-emerald-600">✓ {h.present_emails.length} presentes</p>
                <p className="text-destructive">✗ {h.absent_emails.length} ausentes</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;