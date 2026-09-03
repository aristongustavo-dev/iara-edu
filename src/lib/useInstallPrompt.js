import { useState, useEffect, useCallback } from 'react';

const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const check = () => {
      setStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true,
      );
    };
    check();
    window.addEventListener('appinstalled', check);
    const beforeinstallprompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', beforeinstallprompt);
    return () => {
      window.removeEventListener('appinstalled', check);
      window.removeEventListener('beforeinstallprompt', beforeinstallprompt);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return choice && choice.outcome === 'accepted';
  }, [deferredPrompt]);

  return { canInstall: !!deferredPrompt && !standalone, promptInstall, standalone };
};

export default useInstallPrompt;