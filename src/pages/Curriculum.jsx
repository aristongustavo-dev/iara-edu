import React from 'react';
import { PageHeader } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table';
import { bnccSubjects } from '@/api/subjects';
import { gradeLabel } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

const BASE_SKILLS = {
  matematica: { '6_ano_fund': ['EF06MA01', 'EF06MA03', 'EF06MA09'], '7_ano_fund': ['EF07MA01', 'EF07MA03', 'EF07MA07'], '8_ano_fund': ['EF08MA01', 'EF08MA06'], '9_ano_fund': ['EF09MA01', 'EF09MA07'] },
  lingua_portuguesa: { '6_ano_fund': ['EF06LP01', 'EF06LP05', 'EF67LP03'], '7_ano_fund': ['EF67LP02', 'EF67LP07'], '8_ano_fund': ['EF89LP02', 'EF89LP05'] },
  ciencias: { '6_ano_fund': ['EF06CI01', 'EF06CI05'], '7_ano_fund': ['EF07CI01'], '8_ano_fund': ['EF08CI01'] },
  historia: { '6_ano_fund': ['EF06HI01'], '7_ano_fund': ['EF07HI03'] },
};

const GRADES = ['6_ano_fund', '7_ano_fund', '8_ano_fund', '9_ano_fund', '1_medio', '2_medio', '3_medio'];

const Curriculum = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Matriz Curricular"
        subtitle="Estrutura de habilidades por área do conhecimento"
        icon="📚"
        actions={<Badge tone="primary">BNCC</Badge>}
      />

      <div className="card-playful p-5">
        <h3 className="font-heading font-bold text-lg mb-3">Áreas do conhecimento</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {bnccSubjects.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border p-3 flex flex-col items-center gap-1.5 text-center">
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-xs font-bold">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-playful p-5">
        <h3 className="font-heading font-bold text-lg mb-1">Habilidades por série (amostra BNCC)</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Série vinculada ao seu perfil: <b>{gradeLabel(user?.grade_level)}</b>
        </p>
        <Table>
          <THead>
            <TH>Disciplina</TH>
            {GRADES.slice(0, 4).map((g) => <TH key={g}>{gradeLabel(g)}</TH>)}
          </THead>
          <TBody>
            {bnccSubjects.slice(0, 4).map((s) => (
              <TR key={s.id}>
                <TD className="font-bold text-foreground">{s.emoji} {s.label}</TD>
                {GRADES.slice(0, 4).map((g) => (
                  <TD key={g}>
                    <div className="flex flex-wrap gap-1">
                      {BASE_SKILLS[s.id]?.[g]?.map((sk) => (
                        <Badge key={sk} tone={user?.grade_level === g ? 'primary' : 'neutral'}>{sk}</Badge>
                      )) || <span className="text-muted-foreground">—</span>}
                    </div>
                  </TD>
                ))}
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <div className="rounded-2xl bg-sky-50 border border-sky-200 p-5 text-sm text-sky-800">
        💡 <b>Como funciona?</b> Os códigos de habilidade (ex: EF06MA01) seguem a Base Nacional Comum Curricular.
        A Iara usa os mesmos códigos nas atividades para identificar automaticamente o que precisa de reforço.
      </div>
    </div>
  );
};

export default Curriculum;