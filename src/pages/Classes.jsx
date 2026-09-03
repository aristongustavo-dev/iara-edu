import React, { useState, useEffect } from 'react';
import { base44Client } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Select, Field } from '@/components/ui/input';
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table';
import { toast } from '@/components/ui/toaster';
import { gradeLabel } from '@/lib/utils';
import { gradeLevels } from '@/api/subjects';
import { Pencil, Trash2, Plus } from 'lucide-react';

const emptyClass = () => ({
  name: '', grade_level: '6_ano_fund', subject: 'geral',
  teacher_email: '', school_name: 'Escola Municipal Sonho Dourado',
  year: new Date().getFullYear(), color: '#7c3aed', student_emails: [],
});

const Classes = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);

  const load = async () => {
    const [cls, usrs] = await Promise.all([base44Client.getAll('classes', 'name', 'asc'), base44Client.getAll('users')]);
    setClasses(cls);
    setUsers(usrs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const teachers = users.filter((u) => u.role === 'professor');
  const students = users.filter((u) => u.role === 'aluno');

  const save = async () => {
    if (!draft.name.trim() || !draft.teacher_email) {
      toast.error('Dados incompletos', 'Informe o nome da turma e o professor responsável.');
      return;
    }
    if (draft.id) {
      await base44Client.put('classes', draft.id, draft);
      // sync users' class_id
      const allStudents = students;
      const kept = new Set(draft.student_emails);
      for (const s of allStudents) {
        const target = kept.has(s.email) ? draft.id : (s.class_id === draft.id ? '' : s.class_id);
        if (s.class_id !== target) await base44Client.put('users', s.id, { class_id: target });
      }
      toast.success('Turma atualizada!');
    } else {
      const created = await base44Client.post('classes', draft);
      for (const s of students) {
        if (draft.student_emails.includes(s.email)) {
          await base44Client.put('users', s.id, { class_id: created.id });
        }
      }
      toast.success('Turma criada!');
    }
    setDraft(null);
    load();
    if (user?.role === 'professor') {
      window.location.reload();
    }
  };

  const remove = async (cls) => {
    for (const s of students) {
      if (s.class_id === cls.id) await base44Client.put('users', s.id, { class_id: '' });
    }
    await base44Client.delete('classes', cls.id);
    toast.info('Turma excluída.');
    load();
  };

  const toggleStudent = (email) => {
    const list = draft.student_emails.includes(email)
      ? draft.student_emails.filter((e) => e !== email)
      : [...draft.student_emails, email];
    setDraft({ ...draft, student_emails: list });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Turmas"
        subtitle="Organize os alunos por turma e professor"
        icon="🏫"
        actions={<Button onClick={() => setDraft(emptyClass())}><Plus size={18} /> Nova turma</Button>}
      />

      {classes.length === 0 ? (
        <EmptyState icon="🏫" title="Nenhuma turma cadastrada" description="Crie a primeira turma para alocar os alunos.">
          <Button onClick={() => setDraft(emptyClass())}>Criar turma</Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classes.map((c) => (
            <div key={c.id} className="card-playful p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ background: `${c.color}20`, color: c.color }}>🎓</span>
                  <div>
                    <h3 className="font-heading font-bold text-lg">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{gradeLabel(c.grade_level)} • {c.year}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setDraft(JSON.parse(JSON.stringify(c)))}><Pencil size={15} /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(c)}><Trash2 size={15} /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="primary">{c.student_emails?.length || 0} alunos</Badge>
                <Badge tone="neutral">{teachers.find((t) => t.email === c.teacher_email)?.name || c.teacher_email}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Editar turma' : 'Nova turma'} className="max-w-2xl">
        {draft && (
          <div className="space-y-4">
            <Field label="Nome da turma">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex: 6º Ano A" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Série">
                <Select value={draft.grade_level} onChange={(e) => setDraft({ ...draft, grade_level: e.target.value })}>
                  {gradeLevels.map((g) => <option key={g} value={g}>{gradeLabel(g)}</option>)}
                </Select>
              </Field>
              <Field label="Ano letivo">
                <Input type="number" value={draft.year} onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Professor responsável">
              <Select value={draft.teacher_email} onChange={(e) => setDraft({ ...draft, teacher_email: e.target.value })}>
                <option value="">Selecione um professor…</option>
                {teachers.map((t) => <option key={t.id} value={t.email}>{t.name} ({t.email})</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Disciplina principal">
                <Select value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })}>
                  <option value="geral">Geral</option>
                  {['matematica', 'lingua_portuguesa', 'ciencias', 'historia', 'geografia', 'arte', 'educacao_fisica', 'lingua_inglesa', 'ensino_religioso'].map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Cor de identificação">
                <Input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="h-10 p-1" />
              </Field>
            </div>
            <Field label={`Alunos matriculados (${draft.student_emails.length})`}>
              <div className="max-h-48 overflow-y-auto rounded-2xl border border-border divide-y divide-border">
                {students.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhum aluno cadastrado ainda.</p>}
                {students.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40">
                    <input
                      type="checkbox"
                      checked={draft.student_emails.includes(s.email)}
                      onChange={() => toggleStudent(s.email)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-semibold flex-1">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.email}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>
          <Button onClick={save}>{draft?.id ? 'Salvar' : 'Criar turma'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Classes;