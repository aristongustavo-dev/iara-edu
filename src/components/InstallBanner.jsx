import useInstallPrompt from '@/lib/useInstallPrompt';
import { cn } from '@/lib/utils';

const InstallBanner = ({ className }) => {
  const { canInstall, promptInstall, standalone } = useInstallPrompt();

  if (standalone) return null;
  if (!canInstall) return null;

  return (
    <div className={cn('fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] w-[calc(100%-2rem)] max-w-md animate-pop-in', className)}>
      <div className="card-playful p-4 flex items-center gap-3 bg-white/95 backdrop-blur">
        <img src="/icons/icon-192.png" alt="IARA EDU" className="w-12 h-12 rounded-2xl shadow-md" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Instalar IARA EDU</p>
          <p className="text-xs text-muted-foreground">Instale no seu aparelho para usar como um aplicativo, com ícone no menu inicial e funcionamento offline.</p>
        </div>
        <button
          type="button"
          onClick={promptInstall}
          className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all"
        >
          Instalar
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;