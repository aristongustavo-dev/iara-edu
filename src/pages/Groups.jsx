import React, { useState, useEffect } from 'react';
import { base44Client } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Select, Field } from '@/components/ui/input';
import { toast } from '@/components/ui/toaster';
import { Plus, Trash2 } from 'lucide-react';

const Groups = () => {
  const { user } = useAuth();
  const staff = user?.role === 'professor' || user?.role === 'admin' || user?.role === 'direcao' || user?.role === 'secretaria';
  const [groups, setGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);

  const load = async () => {
    const [g, c, s, a] = await Promise.all([
      base44Client.getAll('groups'),
      base44Client.get('classes'),
      base44Client.get('users', { role: 'aluno' }),
      base44Client.get('attempts'),
    ]);
    setGroups(g);
    setClasses(c);
    setStudents(s);
    setAttempts(a);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const xpFor = (email) => attempts.filter((a) => a.student_email === email).reduce((acc, a) => acc + (a.xp_earned || 0), 0);

  const create = async () => {
    if (!draft.name.trim()) return;
    const cls = classes.find((c) => c.id === draft.class_id);
    const classStudents = students.filter((s) => cls?.student_emails?.includes(s.email));
    const list = draft.student_emails.length ? draft.student_emails : classStudents.map((s) => s.email);
    await base44Client.post('groups', {
      name: draft.name, class_id: draft.class_id, created_by_email: user.email,
      group_type: 'competicao', phase: 1, student_emails: list,
      activity_ids: [], emoji: draft.emoji || '🏆',
    });
    toast.success('Grupo criado!', `O grupo ${draft.name} está pronto para competir.`);
    setDraft(null);
    load();
  };

  const remove = async (g) => {
    await base44Client.delete('groups', g.id);
    toast.info('Grupo removido.');
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

  const visible = staff ? groups : groups.filter((g) => g.student_emails?.includes(user.email));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grupos de Competição"
        subtitle="Crie equipes e acompanhe o ranqueamento da turma"
        icon="🏆"
        actions={staff && (
          <Button onClick={() => setDraft({ name: '', class_id: classes[0]?.id || '', student_emails: [], emoji: '🏆' })}>
            <Plus size={18} /> Novo grupo
          </Button>
        )}
      />

      {visible.length === 0 ? (
        <EmptyState icon="🏆" title="Nenhum grupo" description={staff ? 'Crie um grupo para sua turma competir!' : 'Você ainda não está em nenhum grupo.'} />
      ) : (
        <div className="space-y-6">
          {visible.map((g) => {
            const members = students.filter((s) => g.student_emails?.includes(s.email));
            const ranked = [...members].sort((b, a) => xpFor(a.email) - xpFor(b.email));
            const cls = classes.find((c) => c.id === g.class_id);
            return (
              <div key={g.id} className="card-playful p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{g.emoji}</span>
                    <div>
                      <h3 className="font-heading font-bold text-xl">{g.name}</h3>
                      <p className="text-xs text-muted-foreground">{cls?.name || ''} • {members.length} participantes</p>
                    </div>
                  </div>
                  {staff && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(g)}><Trash2 size={15} /></Button>
                  )}
                </div>
                <div className="space-y-2">
                  {ranked.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
                      <span className="font-display font-bold text-lg w-7 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}
                      </span>
                      <span className="flex-1 font-semibold text-sm">{s.name}</span>
                      <Badge tone="warning">⚡ {xpFor(s.email)} XP</Badge>
                      {s.email === user.email && <Badge tone="primary">você</Badge>}
                    </div>
                  ))}
                </div>
                {user && !staff && ranked.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Complete mais atividades para subir no ranking do {g.name}!
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title="Novo grupo" className="max-w-xl">
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Nome do grupo" className="col-span-2">
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex: Super Cientistas" />
              </Field>
              <Field label="Emoji">
                <Input value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} />
              </Field>
            </div>
            <Field label="Turma">
              <Select value={draft.class_id} onChange={(e) => setDraft({ ...draft, class_id: e.target.value })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label={`Participantes (${draft.student_emails.length})`}>
              <div className="max-h-44 overflow-y-auto rounded-2xl border border-border divide-y divide-border">
                {classes.find((c) => c.id === draft.class_id)?.student_emails?.filter((em) => students.find((s) => s.email === em)).length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">Nenhum aluno nesta turma.</p>
                )}
                {students
                  .filter((s) => classes.find((c) => c.id === draft.class_id)?.student_emails?.includes(s.email))
                  .map((s) => (
                    <label key={s.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40">
                      <input type="checkbox" checked={draft.student_emails.includes(s.email)} onChange={() => toggleStudent(s.email)} className="w-4 h-4 accent-primary" />
                      <span className="text-sm font-semibold flex-1">{s.name}</span>
                    </label>
                  ))}
              </div>
            </Field>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>
          <Button onClick={create}>Criar grupo</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Groups;