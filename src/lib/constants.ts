export const CURRENCIES = ['ARS', 'USD'] as const;

export const DEFAULT_CATEGORIES = [
  { name: 'Mercado', icon: 'ShoppingCart', color: '#9FCEA0', type: 'expense' as const },
  { name: 'Comer afuera', icon: 'Utensils', color: '#E8A37C', type: 'expense' as const },
  { name: 'Transporte', icon: 'Car', color: '#7FA5C4', type: 'expense' as const },
  { name: 'Combustible', icon: 'Fuel', color: '#C9B27E', type: 'expense' as const },
  { name: 'Suscripciones', icon: 'Tv', color: '#B89FCE', type: 'expense' as const },
  { name: 'Ocio', icon: 'Film', color: '#E89FC4', type: 'expense' as const },
  { name: 'Alquiler', icon: 'Home', color: '#E8D5A8', type: 'expense' as const },
  { name: 'Servicios', icon: 'Zap', color: '#E8C75A', type: 'expense' as const },
  { name: 'Compras', icon: 'ShoppingBag', color: '#CE9F9F', type: 'expense' as const },
  { name: 'Ingresos', icon: 'Briefcase', color: '#9FCEA0', type: 'income' as const },
  { name: 'Viajes', icon: 'Plane', color: '#7FC4B4', type: 'expense' as const },
  { name: 'Educación', icon: 'GraduationCap', color: '#B4A993', type: 'expense' as const },
  { name: 'Salud', icon: 'Heart', color: '#D97A6C', type: 'expense' as const },
] as const;

export const formatARS = (cents: number, showSign = true): string => {
  const value = cents / 100;
  const sign = showSign && value > 0 ? '+' : '';
  return sign + '$' + Math.abs(value).toLocaleString('es-AR', { maximumFractionDigits: 0 });
};

export const formatUSD = (cents: number, showSign = true): string => {
  const value = cents / 100;
  const sign = showSign && value > 0 ? '+' : '';
  return sign + 'US$' + Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 });
};
