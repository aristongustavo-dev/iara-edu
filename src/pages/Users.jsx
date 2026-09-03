import React, { useState, useEffect } from 'react';
import { base44Client } from '@/api/base44Client';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Select, Field } from '@/components/ui/input';
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toaster';
import { roleLabel, gradeLabel } from '@/lib/utils';
import { roleOptions, gradeLevels } from '@/api/subjects';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [draft, setDraft] = useState(null);

  const load = () => {
    Promise.all([
      base44Client.getAll('users', 'name', 'asc'),
      base44Client.get('classes'),
    ]).then(([rows, classes]) => {
      setUsers(rows.map((u) => ({ ...u, _class: classes.find((c) => c.id === u.class_id) })));
      setLoading(false);
    });
  };

  useEffect(load, []);

  const filtered = users.filter((u) => roleFilter === 'all' || u.role === roleFilter);

  const save = async () => {
    if (!draft.name.trim() || !draft.email.includes('@')) {
      toast.error('Dados inválidos', 'Informe nome e um e-mail válido.');
      return;
    }
    const payload = {
      name: draft.name, email: draft.email.trim().toLowerCase(), role: draft.role,
      school_name: draft.school_name, grade_level: draft.grade_level,
      class_id: draft.class_id || '', parent_email: draft.parent_email || '',
      subjects: draft.subjects || [], xp: draft.xp || 0, level: draft.level || 1,
      badges: draft.badges || [], total_activities: draft.total_activities || 0,
      total_correct: draft.total_correct || 0, streak_days: draft.streak_days || 0,
    };
    if (draft.id) {
      await base44Client.put('users', draft.id, payload);
      toast.success('Usuário atualizado!');
    } else {
      const exists = users.find((u) => u.email === payload.email);
      if (exists) {
        toast.error('E-mail já cadastrado');
        return;
      }
      await base44Client.post('users', payload);
      toast.success('Usuário cadastrado!');
    }
    setDraft(null);
    load();
  };

  const remove = async (u) => {
    if (u.id === currentUser.id) {
      toast.error('Você não pode excluir a si mesmo');
      return;
    }
    await base44Client.delete('users', u.id);
    toast.info('Usuário removido.');
    load();
  };

  const addStudent = () => setDraft({
    name: '', email: '', role: 'aluno', school_name: 'Escola Municipal Sonho Dourado',
    grade_level: '6_ano_fund', class_id: '', parent_email: '', badges: [],
    xp: 0, level: 1, total_activities: 0, total_correct: 0, streak_days: 0,
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
      <PageHeader
        title="Alunos e Usuários"
        subtitle="Gerencie os perfis da plataforma"
        icon="🎒"
        actions={<Button onClick={addStudent}><Plus size={18} /> Novo aluno</Button>}
      />

      <Tabs
        items={[{ value: 'all', label: 'Todos' }, ...roleOptions.map((r) => ({ value: r.id, label: r.label }))]}
        active={roleFilter}
        onChange={setRoleFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState icon="🎒" title="Nenhum usuário encontrado" description="Cadastre alunos ou ajuste o filtro." />
      ) : (
        <Table>
          <THead>
            <TH>Nome</TH>
            <TH>Perfil</TH>
            <TH>Série</TH>
            <TH>Turma</TH>
            <TH>XP</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {filtered.map((u) => (
              <TR key={u.id}>
                <TD>
                  <p className="font-bold text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TD>
                <TD><Badge tone="secondary">{roleLabel(u.role)}</Badge></TD>
                <TD>{u.role === 'aluno' ? gradeLabel(u.grade_level) : '—'}</TD>
                <TD>{u._class?.name || '—'}</TD>
                <TD className="font-bold text-amber-600">{u.xp || 0}</TD>
                <TD>
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => setDraft(JSON.parse(JSON.stringify(u)))}><Pencil size={15} /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(u)}><Trash2 size={15} /></Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Editar usuário' : 'Novo aluno'}>
        {draft && (
          <div className="space-y-4">
            <Field label="Nome completo">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="E-mail">
              <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Perfil">
                <Select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                  {roleOptions.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </Select>
              </Field>
              <Field label="Série">
                <Select value={draft.grade_level} onChange={(e) => setDraft({ ...draft, grade_level: e.target.value })}>
                  {gradeLevels.map((g) => <option key={g} value={g}>{gradeLabel(g)}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Escola">
              <Input value={draft.school_name} onChange={(e) => setDraft({ ...draft, school_name: e.target.value })} />
            </Field>
            <Field label="E-mail do responsável">
              <Input value={draft.parent_email || ''} onChange={(e) => setDraft({ ...draft, parent_email: e.target.value })} placeholder="pai@familia.com" />
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

export default Users;