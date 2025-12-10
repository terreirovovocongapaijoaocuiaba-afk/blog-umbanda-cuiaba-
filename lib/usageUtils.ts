
export const USAGE_KEY = 'umbanda_cuiaba_free_usage';
export const PREMIUM_KEY = 'umbanda_cuiaba_is_premium'; // Simulação local de estado premium

// Verifica se o usuário é Premium (Local ou via Auth no futuro)
export const isUserPremium = (): boolean => {
  return localStorage.getItem(PREMIUM_KEY) === 'true';
};

// Define status premium (usado pelo simulador de webhook)
export const setPremiumStatus = (status: boolean) => {
  localStorage.setItem(PREMIUM_KEY, status.toString());
};

export const canUseFreeResource = (): boolean => {
  // 1. Se for Premium, uso ilimitado sempre
  if (isUserPremium()) return true;

  // 2. Se for Free, verifica timer de 24h
  const lastUsage = localStorage.getItem(USAGE_KEY);
  if (!lastUsage) return true;

  const lastDate = new Date(parseInt(lastUsage));
  const now = new Date();
  
  // Diferença em milissegundos (24 horas = 86400000 ms)
  const diff = now.getTime() - lastDate.getTime();
  return diff > 86400000;
};

export const registerFreeUsage = () => {
  // Só registra uso se NÃO for premium, para contar o limite
  if (!isUserPremium()) {
    localStorage.setItem(USAGE_KEY, Date.now().toString());
  }
};

export const getTimeUntilNextFree = (): string => {
  if (isUserPremium()) return 'Ilimitado';

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
