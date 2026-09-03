import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Lock } from 'lucide-react';

const staffRoles = ['direcao', 'secretaria'];

const RequireRole = ({ children, level }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
        <Lock size={40} className="text-muted-foreground" />
        <h2 className="font-heading font-bold text-xl">Acesso restrito</h2>
        <p className="text-muted-foreground text-sm">Você precisa entrar para acessar esta página.</p>
        <Link to="/acesso" className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl">Entrar</Link>
      </div>
    );
  }

  if (level === 'admin') {
    const allowed = user.role === 'admin' || user.role === 'professor' || staffRoles.includes(user.role);
    if (!allowed) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
          <Lock size={40} className="text-muted-foreground" />
          <h2 className="font-heading font-bold text-xl">Acesso restrito</h2>
          <p className="text-muted-foreground text-sm">Apenas professores e gestão podem acessar esta área.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
};
export default RequireRole;