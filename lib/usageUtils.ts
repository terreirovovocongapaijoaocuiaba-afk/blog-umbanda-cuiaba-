
export const USAGE_KEY = 'umbanda_cuiaba_free_usage';

export const canUseFreeResource = (): boolean => {
  const lastUsage = localStorage.getItem(USAGE_KEY);
  if (!lastUsage) return true;

  const lastDate = new Date(parseInt(lastUsage));
  const now = new Date();
  
  // Diferença em milissegundos (24 horas = 86400000 ms)
  const diff = now.getTime() - lastDate.getTime();
  return diff > 86400000;
};

export const registerFreeUsage = () => {
  localStorage.setItem(USAGE_KEY, Date.now().toString());
};

export const getTimeUntilNextFree = (): string => {
  const lastUsage = localStorage.getItem(USAGE_KEY);
  if (!lastUsage) return '';

  const nextDate = new Date(parseInt(lastUsage) + 86400000);
  const now = new Date();
  const diff = nextDate.getTime() - now.getTime();

  if (diff <= 0) return 'Disponível agora';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};
