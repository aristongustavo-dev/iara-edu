import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  Home, Map, Medal, User, LogOut, BookOpen, Trophy, LayoutDashboard,
  ClipboardList, Users, GraduationCap, CalendarCheck, FileBarChart2,
  Megaphone, Store, Sparkles, PieChart, Menu, X, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MermaidLogo } from '@/components/ui/MermaidLogo';
import { Avatar } from '@/components/ui/avatar';

const isStaff = (role) => role === 'admin' || role === 'professor' || role === 'direcao' || role === 'secretaria';
const isAdminRole = (role) => role === 'admin' || role === 'direcao';

const studentItems = [
  { to: '/', label: 'Meu Mundo', icon: Map },
  { to: '/Activities', label: 'Atividades', icon: BookOpen },
  { to: '/Farm', label: 'Fazenda', icon: Home },
  { to: '/FarmMissions', label: 'Missões', icon: Trophy },
  { to: '/FarmShop', label: 'Mercado', icon: Store },
  { to: '/FarmRanking', label: 'Ranking', icon: PieChart },
  { to: '/Medals', label: 'Conquistas', icon: Medal },
  { to: '/MyReport', label: 'Relatório', icon: PieChart },
  { to: '/Mural', label: 'Avisos', icon: Megaphone },
  { to: '/CharacterCreation', label: 'Avatar', icon: Sparkles },
  { to: '/Profile', label: 'Perfil', icon: User },
];

const staffItems = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/Activities', label: 'Atividades', icon: BookOpen },
  { to: '/ActivityManager', label: 'Gerenciar Atividades', icon: ClipboardList, adminOnly: true },
  { to: '/Classes', label: 'Turmas', icon: GraduationCap, adminOnly: true },
  { to: '/Teachers', label: 'Professores', icon: Users, adminOnly: true },
  { to: '/Users', label: 'Alunos', icon: User, adminOnly: true },
  { to: '/Attendance', label: 'Frequência', icon: CalendarCheck, adminOnly: true },
  { to: '/Groups', label: 'Grupos', icon: Trophy, adminOnly: true },
  { to: '/Reports', label: 'Relatórios', icon: FileBarChart2, adminOnly: true },
  { to: '/Curriculum', label: 'Matriz Curricular', icon: BookOpen, adminOnly: true },
  { to: '/Mural', label: 'Mural de Avisos', icon: Megaphone },
  { to: '/FarmAdmin', label: 'A Fazendinha', icon: Map },
  { to: '/painel-usuario', label: 'Painel', icon: Store },
];

const NavLink = ({ item, current, onClick }) => (
  <Link
    to={item.to}
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 p-3 rounded-xl transition-colors',
      current === item.label
        ? 'bg-primary/10 text-primary font-bold'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    )}
  >
    <item.icon size={20} className="shrink-0" />
    <span className="font-medium text-sm">{item.label}</span>
  </Link>
);

const AppLayout = ({ children, currentPageName }) => {
  const { user, logout, character } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const staff = isStaff(user?.role);
  const items = staff ? staffItems.filter((i) => !i.adminOnly || isAdminRole(user.role)) : studentItems;
  const currentLabel = items.find((i) => i.to === `/${currentPageName}` || (currentPageName === 'Home' && i.to === '/'))?.label;
  const mobileFavorites = items.slice(0, 5);

  return (
    <div className="flex h-screen bg-secondary">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border p-4 shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <MermaidLogo className="w-9 h-9" />
          <div>
            <h1 className="font-display font-bold text-foreground leading-none">IARA EDU</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">{staff ? 'Espaço Institucional' : 'Aventura de Aprender'}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {items.map((item) => (
            <NavLink key={item.to} item={item} current={currentLabel} />
          ))}
        </nav>

        <button
          onClick={() => window.dispatchEvent(new Event('iara:start-tour'))}
          className="mb-3 flex items-center justify-center gap-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/15 rounded-xl p-2.5 transition-colors"
        >
          <HelpCircle size={16} /> Como usar o app
        </button>

        <div className="mt-4 p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar character={character} role={user?.role} className="w-10 h-10 rounded-full text-xl" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'aluno' ? `Lvl ${character?.level || user?.level || 1} • ${user?.email}` : user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 font-medium w-full p-2 rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-muted/70 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <MermaidLogo className="w-8 h-8" />
              <h1 className="font-display font-bold text-foreground leading-none">IARA EDU</h1>
            </Link>
          </div>
          <Link to={staff ? '/Dashboard' : '/Medals'} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <Avatar character={character} role={user?.role} className="w-8 h-8 rounded-full text-sm" />
          </Link>
        </header>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-card shadow-2xl flex flex-col animate-pop-in">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <MermaidLogo className="w-8 h-8" />
                  <div>
                    <p className="font-display font-bold text-foreground leading-none">IARA EDU</p>
                    <p className="text-[10px] text-muted-foreground">{staff ? 'Espaço Institucional' : 'Aventura de Aprender'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  aria-label="Fechar menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {items.map((item) => (
                  <NavLink key={item.to} item={item} current={currentLabel} onClick={() => setMenuOpen(false)} />
                ))}
              </nav>

              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar character={character} role={user?.role} className="w-10 h-10 rounded-full text-xl" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 font-medium w-full p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={16} /> Sair
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>

        {/* Bottom Nav Mobile */}
        <nav className="md:hidden flex items-center justify-around p-2 bg-card border-t border-border pb-safe">
          {mobileFavorites.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg',
                currentLabel === item.label ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <item.icon size={22} />
              <span className="text-[9px] font-bold">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default AppLayout;