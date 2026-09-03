import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getAllUsers } from '@/api/integrations';
import { roleLabel, gradeLabel } from '@/lib/utils';
import { gradeLevels } from '@/api/subjects';
import { Button } from '@/components/ui/button';
import { MermaidLogo } from '@/components/ui/MermaidLogo';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Lock, Mail, User, Rocket, LogIn } from 'lucide-react';

const Acesso = () => {
  const { login, registerStudentAccount, authError, clearAuthError } = useAuth();
  const [mode, setMode] = useState('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', grade: '6_ano_fund' });
  const demoUsers = getAllUsers();

  const doLogin = (mail) => {
    if (!mail) return;
    login(mail.trim().toLowerCase(), password);
  };

  const doRegister = () => {
    if (form.password !== form.confirm) {
      clearAuthError();
      alert('As senhas não coincidem. Confira e tente de novo!');
      return;
    }
    registerStudentAccount({
      name: form.name, email: form.email, password: form.password, grade_level: form.grade,
    });
  };

  const switchMode = (m) => {
    setMode(m);
    clearAuthError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-4">
      <div className="w-full max-w-md space-y-6 animate-pop-in">
        {/* Brand */}
        <div className="text-center space-y-2">
          <MermaidLogo className="w-20 h-20 mx-auto rounded-3xl shadow-xl shadow-primary/30 mb-1" />
          <h1 className="text-4xl font-display font-bold text-foreground">IARA EDU</h1>
          <p className="text-muted-foreground">Aprender jogando é muito mais divertido! 🚜✨</p>
        </div>

        <div className="card-playful p-6 space-y-5">
          {/* Modes */}
          <div className="flex items-center gap-1.5 bg-muted/70 rounded-2xl p-1.5">
            {[
              { id: 'entrar', label: 'Entrar' },
              { id: 'cadastro', label: 'Criar minha conta' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                  mode === m.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'entrar' ? (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); doLogin(email); }}>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearAuthError(); }}
                  placeholder="Seu e-mail institucional"
                  className="pl-10 h-12"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearAuthError(); }}
                  placeholder="Sua senha (se criou a conta)"
                  className="pl-10 h-12"
                />
              </div>
              {authError?.type === 'user_not_registered' && (
                <p className="text-sm text-destructive font-semibold bg-destructive/10 rounded-xl p-3">
                  Este e-mail não está cadastrado. Crie sua conta na guia “Criar minha conta” ou use uma conta de demonstração abaixo.
                </p>
              )}
              {authError?.type === 'invalid_password' && (
                <p className="text-sm text-destructive font-semibold bg-destructive/10 rounded-xl p-3">
                  Senha incorreta. Tente de novo. 🔒
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={!email}>
                <LogIn size={16} /> Entrar
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                💡 As contas de demonstração entram sem senha — basta tocar no perfil abaixo.
              </p>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); clearAuthError(); }}
                  placeholder="Seu nome completo"
                  className="pl-10 h-12"
                />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); clearAuthError(); }}
                  placeholder="Seu e-mail (ex.: joao.souza@email.com)"
                  className="pl-10 h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); clearAuthError(); }}
                    placeholder="Crie uma senha"
                    className="pl-10 h-12"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => { setForm({ ...form, confirm: e.target.value }); clearAuthError(); }}
                    placeholder="Confirme a senha"
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <Select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="h-12">
                {gradeLevels.map((g) => (
                  <option key={g} value={g}>Estou no {gradeLabel(g)}</option>
                ))}
              </Select>
              {authError?.type === 'register_error' && (
                <p className="text-sm text-destructive font-semibold bg-destructive/10 rounded-xl p-3">
                  {authError.message}
                </p>
              )}
              <Button size="lg" className="w-full" onClick={doRegister} disabled={!form.name || !form.email || !form.password || !form.confirm}>
                <Rocket size={16} /> Criar minha conta e entrar
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Sua escola já pode ter um link próprio. Ao criar a conta, você entra automaticamente. 🎉
              </p>
            </div>
          )}
        </div>

        {/* Demo accounts */}
        <div className="card-playful p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">🚀 Contas de demonstração</p>
            <Badge tone="neutral">clique para entrar</Badge>
          </div>
          <div className="space-y-2">
            {demoUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => doLogin(u.email)}
                className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg shrink-0">
                  {u.role === 'aluno' ? '🎒' : u.role === 'professor' ? '🧑‍🏫' : u.role === 'pai' ? '👨‍👩‍👦' : '🏫'}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-sm truncate">{u.name}</span>
                  <span className="block text-xs text-muted-foreground truncate">{u.email}</span>
                </span>
                <span className="text-xs font-bold text-muted-foreground shrink-0">{roleLabel(u.role)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Acesso;