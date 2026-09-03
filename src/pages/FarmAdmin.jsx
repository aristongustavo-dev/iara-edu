import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/db';
import { getFarmFor } from '@/api/farm';
import { farmLevelFor, getUnlockedCitiesFor } from '@/api/integrations';
import { PageHeader } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/components/ui/toaster';
import { ProgressBar } from '@/components/ui/metrics';
import { Save } from 'lucide-react';

const isStaff = (role) => ['professor', 'direcao', 'secretaria', 'admin'].includes(role);

const FarmAdmin = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('evolucao');
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState({ title: '', emoji: '🎉', start_date: '', end_date: '' });

  const load = useCallback(() => {
    const users = db.get('users');
    const alunos = users.filter((u) => u.role === 'aluno');
    const withFarm = alunos.map((a) => {
      const farm = getFarmFor(a.email);
      const char = db.get('characters', { student_email: a.email })[0];
      return {
        ...a,
        farm,
        char,
        farmLevel: farm ? farmLevelFor(farm.xp) : 1,
        cities: getUnlockedCitiesFor(char),
      };
    }).sort((a, b) => (b.farm?.xp || 0) - (a.farm?.xp || 0));
    setStudents(withFarm);
    setEvents((db.get('events') || []).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!user || !isStaff(user.role)) {
    return (
      <div className="text-center py-20 card-playful p-8">
        <p className="text-2xl">🔒</p>
        <h2 className="font-heading font-bold mt-2">Área restrita</h2>
        <p className="text-muted-foreground text-sm mt-1">Apenas professores e diretores podem acessar.</p>
      </div>
    );
  }

  const handleCreateEvent = () => {
    if (!form.title || !form.start_date || !form.end_date) {
      toast.error('Faltam dados', 'Preencha título e datas');
      return;
    }
    if (Date.parse(form.end_date) < Date.parse(form.start_date)) {
      toast.error('Datas inválidas', 'O fim deve ser depois do início');
      return;
    }
    db.insert('events', {
      title: form.title,
      emoji: form.emoji || '🎉',
      category: 'escolar',
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      created_by_email: user.email,
      active: true,
    });
    toast.success('Evento criado!', 'Alunos verão a decoração temática na fazenda.');
    setOpenNew(false);
    setForm({ title: '', emoji: '🎉', start_date: '', end_date: '' });
    load();
  };

  const handleToggleEvent = (ev) => {
    db.update('events', ev.id, { active: !ev.active });
    load();
    toast.success('Atualizado', !ev.active ? 'Evento ativado' : 'Evento desativado');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel da Fazendinha"
        subtitle="Acompanhe a evolução das fazendas e gerencie eventos escolares."
        icon="🏡"
        actions={<Button onClick={() => setOpenNew(true)} size="sm">🎉 Novo Evento</Button>}
      />

      <Tabs
        items={[
          { value: 'evolucao', label: '📈 Evolução' },
          { value: 'eventos', label: '🎪 Eventos' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'evolucao' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card-playful p-4 text-center">
              <p className="text-2xl font-display font-bold text-primary">{students.length}</p>
              <p className="text-xs text-muted-foreground">Alunos</p>
            </div>
            <div className="card-playful p-4 text-center">
              <p className="text-2xl font-display font-bold text-amber-600">{students.reduce((a, s) => a + (s.farm?.milhos || 0), 0)}</p>
              <p className="text-xs text-muted-foreground">Milhos totais</p>
            </div>
            <div className="card-playful p-4 text-center">
              <p className="text-2xl font-display font-bold text-emerald-600">{students.reduce((a, s) => a + (s.farm?.harvest_total || 0), 0)}</p>
              <p className="text-xs text-muted-foreground">Colheitas</p>
            </div>
            <div className="card-playful p-4 text-center">
              <p className="text-2xl font-display font-bold text-indigo-500">{students.reduce((a, s) => a + (s.farm?.gemas || 0), 0)}</p>
              <p className="text-xs text-muted-foreground">Gemas</p>
            </div>
          </div>

          <div className="space-y-3">
            {students.map((s) => (
              <div key={s.email} className="card-playful p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <Avatar character={s.char} role="aluno" className="w-11 h-11 rounded-2xl text-xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading font-bold text-sm">{s.name}</p>
                    <Badge tone="primary">Fazenda Nv {s.farmLevel}</Badge>
                    <Badge tone={s.farm ? 'success' : 'neutral'}>{s.farm ? `${s.farm.xp || 0} XP` : 'Sem fazenda'}</Badge>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>🌽 {s.farm?.milhos || 0}</span>
                    <span>💎 {s.farm?.gemas || 0}</span>
                    <span>🧺 {s.farm?.harvest_total || 0} colheitas</span>
                    <span>📚 {s.farm?.atividades_concluidas || 0} atividades</span>
                  </div>
                  <ProgressBar value={(s.farm?.xp || 0) % 100} className="mt-2 h-2" />
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {s.cities?.length || 0} áreas desbloqueadas
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'eventos' && (
        <div className="card-playful p-5">
          <h3 className="font-heading font-bold mb-4">🎪 Eventos Escolares</h3>
          {events.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhum evento criado ainda. Crie o primeiro!</p>
          )}
          <div className="space-y-3">
            {events.map((ev) => {
              const active = ev.active && Date.parse(ev.end_date) >= Date.now();
              return (
                <div key={ev.id} className="flex items-center gap-3 border rounded-xl p-3">
                  <span className="text-3xl">{ev.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ev.start_date).toLocaleDateString('pt-BR')} → {new Date(ev.end_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge tone={active ? 'success' : 'neutral'}>{active ? 'Ativo' : 'Inativo'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => handleToggleEvent(ev)}>
                    {ev.active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'ranking' && (
        <p className="text-muted-foreground">Rankings disponíveis na visão do aluno.</p>
      )}

      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Novo Evento Escolar">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold block mb-1">Título *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Semana da Matemática" />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">Emoji</label>
            <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🎉" maxLength={4} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold block mb-1">Início *</label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Fim *</label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleCreateEvent} className="w-full"><Save size={16}/> Criar Evento</Button>
        </div>
      </Modal>
    </div>
  );
};

export default FarmAdmin;