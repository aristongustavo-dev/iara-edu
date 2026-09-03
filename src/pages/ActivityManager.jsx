import React, { useState, useEffect } from 'react';
import { base44Client } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { PageHeader, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea, Select, Field } from '@/components/ui/input';
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table';
import { toast } from '@/components/ui/toaster';
import { subjectLabel, difficultyLabel, gradeLabel, gameModeLabel } from '@/lib/utils';
import { bnccSubjects } from '@/api/subjects';
import { Plus, Pencil, Trash2, Play } from 'lucide-react';

const QUESTION_TYPES = [
  { id: 'multipla_escolha', label: 'Múltipla escolha' },
  { id: 'verdadeiro_falso', label: 'Verdadeiro/Falso' },
  { id: 'completar', label: 'Completar' },
  { id: 'numerica', label: 'Numérica' },
  { id: 'correspondencia', label: 'Correspondência' },
];

const GAME_MODES = [
  { id: 'quiz_fases', label: 'Quiz em Fases' },
  { id: 'desafio_misto', label: 'Desafio Misto' },
  { id: 'missao_aventura', label: 'Missão Aventura' },
  { id: 'jogo_memoria', label: '🧠 Jogo da Memória' },
  { id: 'forca', label: '🎯 Forca' },
  { id: 'caca_palavras', label: '🔎 Caça-palavras' },
];

const GAME_MODES_SET = new Set(['jogo_memoria', 'forca', 'caca_palavras']);

const emptyQuestion = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  type: 'multipla_escolha',
  statement: '',
  options: [
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
    { id: 'd', text: '' },
  ],
  pairs: [{ left: '', right: '' }, { left: '', right: '' }],
  correct_answer: '',
  explanation: '',
  points: 10,
});

const emptyActivity = (email) => ({
  title: '', description: '', subject: 'matematica', grade_level: '6_ano_fund',
  curriculum_framework: 'bncc', bncc_skills: [], descriptor_code: '',
  game_mode: 'quiz_fases', phase: 1, difficulty: 'facil', xp_reward: 20, medal: 'bronze',
  status: 'rascunho', questions: [], game_content: {}, created_by_email: email,
  assigned_class_ids: [], adapted_by_iara: false,
});

const ActivityManager = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    base44Client.getAll('activities', 'created_at', 'desc').then((rows) => {
      setActivities(rows.filter((a) => a.created_by_email === user.email || user.role === 'admin' || user.role === 'direcao'));
      setLoading(false);
    });
  };

  useEffect(load, [user.email, user.role]);

  const openNew = () => setDraft(emptyActivity(user.email));
  const openEdit = (a) => setDraft(JSON.parse(JSON.stringify(a)));

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error('Revise os campos', 'Adicione um título.');
      return;
    }
    const isGame = GAME_MODES_SET.has(draft.game_mode);
    if (!isGame && !draft.questions.length) {
      toast.error('Revise os campos', 'Adicione pelo menos uma questão.');
      return;
    }
    if (!isGame) {
      const validQuestions = draft.questions.every((q) => {
        if (!q.statement.trim()) return false;
        if (q.type === 'correspondencia') {
          return (q.pairs || []).some((p) => p && p.left.trim() && p.right.trim());
        }
        return !!q.correct_answer;
      });
      if (!validQuestions) {
        toast.error('Questões incompletas', 'Cada questão precisa de enunciado e resposta correta (ou pares, no caso de correspondência).');
        return;
      }
    } else {
      const gc = draft.game_content || {};
      if (draft.game_mode === 'jogo_memoria' && !gc.pairs?.length) {
        toast.error('Conteúdo incompleto', 'Adicione pelo menos um par para o jogo da memória.');
        return;
      }
      if ((draft.game_mode === 'forca' || draft.game_mode === 'caca_palavras') && !gc.words?.length) {
        toast.error('Conteúdo incompleto', 'Adicione pelo menos uma palavra.');
        return;
      }
    }
    setSaving(true);
    const patch = {
      ...draft,
      bncc_skills: typeof draft.bncc_skills === 'string'
        ? draft.bncc_skills.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
        : draft.bncc_skills,
    };
    if (draft.id) {
      await base44Client.put('activities', draft.id, patch);
      toast.success('Atividade atualizada!', 'As alterações foram salvas.');
    } else {
      await base44Client.post('activities', patch);
      toast.success('Atividade criada!', 'Agora publique para seus alunos jogarem.');
    }
    setSaving(false);
    setDraft(null);
    load();
  };

  const toggleStatus = async (a) => {
    await base44Client.put('activities', a.id, { status: a.status === 'publicada' ? 'rascunho' : 'publicada' });
    toast.success(a.status === 'publicada' ? 'Atividade arquivada' : 'Atividade publicada! 🎉', a.title);
    load();
  };

  const remove = async (a) => {
    await base44Client.delete('activities', a.id);
    toast.info('Atividade excluída.');
    load();
  };

  const addQuestion = () => setDraft({ ...draft, questions: [...draft.questions, emptyQuestion()] });
  const updateQuestion = (i, patch) => {
    const questions = draft.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q));
    setDraft({ ...draft, questions });
  };
  const removeQuestion = (i) => {
    const questions = draft.questions.filter((_, idx) => idx !== i);
    setDraft({ ...draft, questions });
  };
  const updateOption = (qIdx, optId, text) => {
    const questions = draft.questions.map((q, idx) => (idx === qIdx
      ? { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)) }
      : q));
    setDraft({ ...draft, questions });
  };
  const addOption = (qIdx) => {
    const questions = draft.questions.map((q, idx) => (idx === qIdx
      ? { ...q, options: [...q.options, { id: `opt_${q.options.length}`, text: '' }] }
      : q));
    setDraft({ ...draft, questions });
  };

  const isGame = GAME_MODES_SET.has(draft?.game_mode);
  const gc = draft?.game_content || {};

  const setGc = (patch) => setDraft({ ...draft, game_content: { ...gc, ...patch } });
  const updatePair = (i, field, value) => {
    const pairs = [...(gc.pairs || [])];
    pairs[i] = { ...(pairs[i] || { left: '', right: '' }), [field]: value };
    setGc({ pairs });
  };
  const removePair = (i) => setGc({ pairs: (gc.pairs || []).filter((_, idx) => idx !== i) });
  const addPair = () => setGc({ pairs: [...(gc.pairs || []), { left: '', right: '' }] });
  const updateWord = (i, field, value) => {
    const words = [...(gc.words || [])];
    const current = typeof words[i] === 'string' ? { word: words[i], hint: '' } : (words[i] || { word: '', hint: '' });
    current[field] = value;
    words[i] = draft.game_mode === 'caca_palavras' ? current.word : current;
    setGc({ words });
  };
  const removeWord = (i) => setGc({ words: (gc.words || []).filter((_, idx) => idx !== i) });
  const addWord = () => setGc({ words: [...(gc.words || []), draft.game_mode === 'caca_palavras' ? '' : { word: '', hint: '' }] });

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
        title="Gerenciador de Atividades"
        subtitle="Crie, edite e publique conteúdos alinhados à BNCC"
        icon="🧰"
        actions={<Button onClick={openNew}><Plus size={18} /> Nova atividade</Button>}
      />

      {activities.length === 0 ? (
        <EmptyState icon="🎒" title="Nenhuma atividade criada" description="Crie sua primeira atividade para os alunos jogarem!">
          <Button onClick={openNew}>Criar atividade</Button>
        </EmptyState>
      ) : (
        <Table>
          <THead>
            <TH>Atividade</TH>
            <TH>Série</TH>
            <TH>Dificuldade</TH>
            <TH>Questões</TH>
            <TH>Status</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {activities.map((a) => (
              <TR key={a.id}>
                <TD>
                  <p className="font-bold text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{subjectLabel(a.subject)} • {gameModeLabel(a.game_mode)} • +{a.xp_reward} XP</p>
                </TD>
                <TD>{gradeLabel(a.grade_level)}</TD>
                <TD><Badge tone="neutral">{difficultyLabel(a.difficulty)}</Badge></TD>
                <TD>
                  {GAME_MODES_SET.has(a.game_mode)
                    ? (a.game_mode === 'jogo_memoria'
                      ? a.game_content?.pairs?.length || 0
                      : a.game_content?.words?.length || 0)
                    : a.questions?.length || 0}
                </TD>
                <TD>
                  <button onClick={() => toggleStatus(a)}>
                    <Badge tone={a.status === 'publicada' ? 'success' : 'warning'}>
                      {a.status === 'publicada' ? '● Publicada' : '○ Rascunho'}
                    </Badge>
                  </button>
                </TD>
                <TD>
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => (window.location.href = `/PlayActivity?id=${a.id}`)}>
                      <Play size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>
                      <Pencil size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(a)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Editar atividade' : 'Nova atividade'} className="max-w-3xl">
        {draft && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Field label="Título">
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ex: Frações na Fazenda" />
              </Field>
              <Field label="Descrição">
                <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Objetivo pedagógico da atividade" />
              </Field>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Disciplina">
                <Select value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })}>
                  {bnccSubjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </Select>
              </Field>
              <Field label="Série">
                <Select value={draft.grade_level} onChange={(e) => setDraft({ ...draft, grade_level: e.target.value })}>
                  {['6_ano_fund', '7_ano_fund', '8_ano_fund', '9_ano_fund', '1_medio', '2_medio', '3_medio'].map((g) => (
                    <option key={g} value={g}>{gradeLabel(g)}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Dificuldade">
                <Select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })}>
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </Select>
              </Field>
              <Field label="Modo de jogo">
                <Select value={draft.game_mode} onChange={(e) => setDraft({ ...draft, game_mode: e.target.value })}>
                  {GAME_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </Select>
              </Field>
              <Field label="XP de recompensa">
                <Input type="number" value={draft.xp_reward} onChange={(e) => setDraft({ ...draft, xp_reward: Number(e.target.value) })} />
              </Field>
              <Field label="Medalha">
                <Select value={draft.medal} onChange={(e) => setDraft({ ...draft, medal: e.target.value })}>
                  <option value="">Sem medalha</option>
                  <option value="bronze">🥉 Bronze</option>
                  <option value="prata">🥈 Prata</option>
                  <option value="ouro">🥇 Ouro</option>
                </Select>
              </Field>
              <Field label="Habilidades BNCC" hint="Separadas por vírgula, ex: EF06MA01, EF06MA03" className="col-span-2">
                <Input
                  value={Array.isArray(draft.bncc_skills) ? draft.bncc_skills.join(', ') : draft.bncc_skills}
                  onChange={(e) => setDraft({ ...draft, bncc_skills: e.target.value })}
                  placeholder="EF06MA01, EF06MA03"
                />
              </Field>
            </div>

            {isGame ? (
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-heading font-bold">
                    {draft.game_mode === 'jogo_memoria' ? `Pares da memória (${gc.pairs?.length || 0})` : `Palavras (${gc.words?.length || 0})`}
                  </h4>
                  <Button size="sm" variant="outline" onClick={draft.game_mode === 'jogo_memoria' ? addPair : addWord}>
                    <Plus size={16} /> Adicionar
                  </Button>
                </div>

                {draft.game_mode === 'jogo_memoria' && (
                  <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3 mb-3">
                    🧠 O aluno vira cartas e deve encontrar o par <b>conceito ↔ definição</b>. Ex.: left="Bioma" right="Conjunto de ecossistemas".
                  </p>
                )}
                {(draft.game_mode === 'forca' || draft.game_mode === 'caca_palavras') && (
                  <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3 mb-3">
                    {draft.game_mode === 'forca'
                      ? '🎯 O aluno descobre a palavra com dica e letras. Use UMA palavra por linha (sem espaços).'
                      : '🔎 O aluno procura as palavras escondidas na sopa de letras (sem espaços, letras maiúsculas).'}
                  </p>
                )}

                {draft.game_mode === 'jogo_memoria' && (
                  <div className="space-y-2">
                    {!gc.pairs?.length && (
                      <p className="text-sm text-muted-foreground rounded-xl bg-muted/60 p-4 text-center">
                        Nenhum par ainda. Adicione pares de conceito ↔ definição.
                      </p>
                    )}
                    {gc.pairs?.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input className="flex-1" value={p.left} onChange={(e) => updatePair(i, 'left', e.target.value)} placeholder="Conceito (ex: Bioma)" />
                        <span className="text-muted-foreground">↔</span>
                        <Input className="flex-1" value={p.right} onChange={(e) => updatePair(i, 'right', e.target.value)} placeholder="Definição (ex: Conjunto de ecossistemas)" />
                        <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => removePair(i)}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {(draft.game_mode === 'forca' || draft.game_mode === 'caca_palavras') && (
                  <div className="space-y-2">
                    {!gc.words?.length && (
                      <p className="text-sm text-muted-foreground rounded-xl bg-muted/60 p-4 text-center">
                        Nenhuma palavra ainda. Adicione as palavras do jogo.
                      </p>
                    )}
                    {gc.words?.map((w, i) => {
                      const wordStr = typeof w === 'string' ? w : w?.word || '';
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <Input className="flex-1" value={wordStr} onChange={(e) => updateWord(i, 'word', e.target.value)} placeholder="Palavra (ex: BIOMA)" />
                          {draft.game_mode === 'forca' && (
                            <Input className="flex-1" value={w?.hint || ''} onChange={(e) => updateWord(i, 'hint', e.target.value)} placeholder="Dica para descobrir" />
                          )}
                          <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => removeWord(i)}>
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-heading font-bold">Questões ({draft.questions.length})</h4>
                <Button size="sm" variant="outline" onClick={addQuestion}><Plus size={16} /> Adicionar questão</Button>
              </div>
              {draft.questions.length === 0 && (
                <p className="text-sm text-muted-foreground rounded-xl bg-muted/60 p-4 text-center">
                  Nenhuma questão ainda. Adicione a primeira para salvar a atividade.
                </p>
              )}
              <div className="space-y-3">
                {draft.questions.map((q, qi) => (
                  <div key={q.id} className="rounded-2xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge tone="secondary">Questão {qi + 1}</Badge>
                      <div className="flex gap-1.5 items-center">
                        <Select
                          className="w-44 h-8 text-xs"
                          value={q.type}
                          onChange={(e) => {
                            const isCorr = e.target.value === 'correspondencia';
                            updateQuestion(qi, {
                              ...q,
                              type: e.target.value,
                              options: e.target.value === 'verdadeiro_falso'
                                ? [{ id: 'verdadeiro', text: 'Verdadeiro' }, { id: 'falso', text: 'Falso' }]
                                : q.options.length < 2 ? [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }] : q.options,
                              pairs: isCorr && !(q.pairs || []).length
                                ? [{ left: '', right: '' }, { left: '', right: '' }]
                                : q.pairs || [],
                              correct_answer: '',
                            });
                          }}
                        >
                          {QUESTION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </Select>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeQuestion(qi)}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>

                    <Input value={q.statement} onChange={(e) => updateQuestion(qi, { statement: e.target.value })} placeholder="Enunciado da questão" />

                    {q.type !== 'correspondencia' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuestion(qi, { correct_answer: opt.id })}
                              className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                                q.correct_answer === opt.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border text-transparent hover:border-emerald-400'
                              }`}
                            >✓</button>
                            <Input
                              className="h-9 text-sm"
                              value={opt.text}
                              onChange={(e) => updateOption(qi, opt.id, e.target.value)}
                              placeholder={q.type === 'verdadeiro_falso' ? opt.text : `Opção ${opt.id.toUpperCase()}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'verdadeiro_falso' && (
                      <p className="text-xs text-muted-foreground">Marque o círculo ✓ ao lado da resposta correta.</p>
                    )}

                    {q.type === 'correspondencia' && (
                      <div className="space-y-2 rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground font-semibold">
                          Monte os pares <b>conceito → definição</b>. O aluno precisa relacionar a esquerda com a direita.
                        </p>
                        {(q.pairs || []).map((p, pi) => (
                          <div key={pi} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <Input
                              className="h-9 text-sm"
                              value={p.left}
                              onChange={(e) => updateQuestion(qi, { pairs: (q.pairs || []).map((x, xi) => (xi === pi ? { ...x, left: e.target.value } : x)) })}
                              placeholder={`Conceito ${pi + 1}`}
                            />
                            <span className="text-muted-foreground">→</span>
                            <Input
                              className="h-9 text-sm"
                              value={p.right}
                              onChange={(e) => updateQuestion(qi, { pairs: (q.pairs || []).map((x, xi) => (xi === pi ? { ...x, right: e.target.value } : x)) })}
                              placeholder={`Definição ${pi + 1}`}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive shrink-0"
                              onClick={() => updateQuestion(qi, { pairs: (q.pairs || []).filter((_, xi) => xi !== pi) })}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuestion(qi, { pairs: [...(q.pairs || []), { left: '', right: '' }] })}
                        >
                          <Plus size={15} /> Adicionar par
                        </Button>
                      </div>
                    )}

                    <Input value={q.explanation} onChange={(e) => updateQuestion(qi, { explanation: e.target.value })} placeholder="Explicação de reforço (aparece após responder)" />
                  </div>
                ))}
              </div>
            </div>
            )}

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>
              <Button onClick={save} disabled={saving}>{saving ? 'Salvando…' : draft.id ? 'Salvar alterações' : 'Criar atividade'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityManager;