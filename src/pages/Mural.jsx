import React, { useState, useEffect } from 'react';
import { base44Client } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea, Select, Field } from '@/components/ui/input';
import { toast } from '@/components/ui/toaster';
import { cn, formatDateTime } from '@/lib/utils';
import { Pin } from 'lucide-react';

const isStaff = (role) => role === 'professor' || role === 'admin' || role === 'direcao' || role === 'secretaria';

const renderSimpleMarkdown = (text) =>
  text.split('\n').map((line, i) => {
    let node = line;
    node = node.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    node = node.replace(/\*(.+?)\*/g, '<i>$1</i>');
    return <p key={i} className={cn('text-sm text-muted-foreground', i > 0 && 'mt-1')} dangerouslySetInnerHTML={{ __html: node || '&nbsp;' }} />;
  });

const audienceLabel = (a) => ({
  todos: 'Todos', funcionarios: 'Funcionários', alunos: 'Alunos',
  professor: 'Professores', supervisao: 'Supervisão', orientacao: 'Orientação',
  secretaria: 'Secretaria', direcao: 'Direção', individual: 'Individual',
}[a] || a);

const categoryTone = (c) => ({
  aviso: 'warning', comunicado: 'primary', evento: 'info', lembrete: 'neutral',
}[c] || 'primary');

const Mural = () => {
  const { user } = useAuth();
  const staff = isStaff(user?.role);
  const [notices, setNotices] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', audience: 'alunos', category: 'aviso', pinned: false });

  const load = () => {
    base44Client.getAll('notices', 'created_at', 'desc').then((rows) => {
      setNotices(rows.filter((n) => staff || n.audience === 'todos' || n.audience === 'alunos' || n.audience === user.email));
    });
  };

  useEffect(load, [staff, user.email]);

  const create = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    await base44Client.post('notices', {
      ...form,
      author_email: user.email,
      author_name: user.name,
      author_role: user.role,
    });
    toast.success('Aviso publicado!', 'O mural foi atualizado.');
    setOpen(false);
    setForm({ title: '', content: '', audience: 'alunos', category: 'aviso', pinned: false });
    load();
  };

  const togglePin = async (n) => {
    await base44Client.put('notices', n.id, { pinned: !n.pinned });
    load();
  };

  const remove = async (n) => {
    await base44Client.delete('notices', n.id);
    toast.info('Aviso removido.');
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mural de Avisos"
        subtitle="Fique por dentro das novidades da escola!"
        icon="📌"
        actions={staff && <Button onClick={() => setOpen(true)}>✏️ Novo aviso</Button>}
      />

      {notices.length === 0 ? (
        <EmptyState icon="📭" title="Nenhum aviso por aqui" description="Volte mais tarde para ver novidades." />
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className={cn('card-playful p-5 space-y-2', n.pinned && 'border-2 border-primary/40')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {n.pinned && <Pin size={16} className="text-primary rotate-45" />}
                  <h3 className="font-heading font-bold text-lg">{n.title}</h3>
                </div>
                <Badge tone={categoryTone(n.category)}>{audienceLabel(n.audience)}</Badge>
              </div>
              <div>{renderSimpleMarkdown(n.content)}</div>
              <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                <span>👤 {n.author_name} • {formatDateTime(n.created_at)}</span>
                {staff && (
                  <div className="flex gap-2">
                    <button className="hover:text-primary font-bold" onClick={() => togglePin(n)}>
                      {n.pinned ? 'Desafixar' : 'Fixar'}
                    </button>
                    <button className="hover:text-destructive font-bold" onClick={() => remove(n)}>Excluir</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo aviso">
        <div className="space-y-4">
          <Field label="Título">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do aviso" />
          </Field>
          <Field label="Conteúdo" hint="Você pode usar **negrito** e *itálico*">
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Escreva o conteúdo do aviso…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Público">
              <Select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="todos">Todos</option>
                <option value="alunos">Alunos</option>
                <option value="professor">Professores</option>
                <option value="supervisao">Supervisão</option>
                <option value="secretaria">Secretaria</option>
                <option value="direcao">Direção</option>
                <option value="pai">Responsáveis</option>
              </Select>
            </Field>
            <Field label="Categoria">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="aviso">Aviso</option>
                <option value="comunicado">Comunicado</option>
                <option value="evento">Evento</option>
                <option value="lembrete">Lembrete</option>
              </Select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="w-4 h-4 accent-primary" />
            Fixar no topo do mural
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={create} disabled={!form.title.trim() || !form.content.trim()}>Publicar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Mural;