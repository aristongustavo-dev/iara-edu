import React, { useState, useEffect } from 'react';
import { base44Client } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Field } from '@/components/ui/input';
import { toast } from '@/components/ui/toaster';
import { subjectLabel } from '@/lib/utils';
import { bnccSubjects } from '@/api/subjects';
import { Pencil, Trash2, Plus } from 'lucide-react';

const Teachers = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);

  const load = () => {
    base44Client.get('users', { role: 'professor' }).then((rows) => {
      setTeachers(rows);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const save = async () => {
    if (!draft.name.trim() || !draft.email.includes('@')) {
      toast.error('Dados inválidos', 'Informe nome e um e-mail válido.');
      return;
    }
    const payload = {
      name: draft.name, email: draft.email.trim().toLowerCase(), role: 'professor',
      subjects: draft.subjects,
      school_name: draft.school_name,
      xp: 0, level: 1, badges: [], total_activities: 0, total_correct: 0, streak_days: 0,
    };
    if (draft.id) {
      await base44Client.put('users', draft.id, payload);
      toast.success('Professor atualizado!');
    } else {
      const exists = teachers.find((t) => t.email === payload.email);
      if (exists) {
        toast.error('E-mail já cadastrado', exists.name);
        return;
      }
      await base44Client.post('users', payload);
      toast.success('Professor cadastrado!');
    }
    setDraft(null);
    load();
  };

  const remove = async (t) => {
    await base44Client.delete('users', t.id);
    toast.info('Professor removido.');
    load();
  };

  const toggleSubject = (s) => {
    const list = draft.subjects.includes(s)
      ? draft.subjects.filter((x) => x !== s)
      : [...draft.subjects, s];
    setDraft({ ...draft, subjects: list });
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
        title="Professores"
        subtitle="Cadastre e gerencie o corpo docente"
        icon="🧑‍🏫"
        actions={<Button onClick={() => setDraft({ name: '', email: '', school_name: user?.school_name || '', subjects: [] })}><Plus size={18} /> Novo professor</Button>}
      />

      {teachers.length === 0 ? (
        <EmptyState icon="🧑‍🏫" title="Nenhum professor cadastrado" description="Cadastre o primeiro professor para atribuir turmas.">
          <Button onClick={() => setDraft({ name: '', email: '', school_name: '', subjects: [] })}>Cadastrar professor</Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((t) => (
            <div key={t.id} className="card-playful p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl">🧑‍🏫</span>
                  <div>
                    <h3 className="font-heading font-bold">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setDraft(JSON.parse(JSON.stringify(t)))}><Pencil size={15} /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(t)}><Trash2 size={15} /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(t.subjects || []).map((s) => <Badge key={s} tone="neutral">{subjectLabel(s)}</Badge>)}
              </div>
              {t.school_name && <p className="text-xs text-muted-foreground">🏫 {t.school_name}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Editar professor' : 'Novo professor'}>
        {draft && (
          <div className="space-y-4">
            <Field label="Nome completo">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex: Professora Marina" />
            </Field>
            <Field label="E-mail institucional">
              <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="professor@escola.com" />
            </Field>
            <Field label="Escola">
              <Input value={draft.school_name} onChange={(e) => setDraft({ ...draft, school_name: e.target.value })} />
            </Field>
            <Field label={`Disciplinas lecionadas (${draft.subjects.length})`}>
              <div className="flex flex-wrap gap-2">
                {bnccSubjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubject(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-colors ${
                      draft.subjects.includes(s.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>
          <Button onClick={save}>{draft?.id ? 'Salvar' : 'Cadastrar'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Teachers;