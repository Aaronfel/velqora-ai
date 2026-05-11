import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';

export default function LoginPage() {
  const t = useTheme();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: t.bg }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl tracking-tight" style={{ color: t.text }}>
            VelqoraAI
          </h1>
          <p className="mt-2 font-sans text-sm" style={{ color: t.text3 }}>
            Finanzas inteligentes, en familia
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none"
            style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none"
            style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text }}
          />

          {error && (
            <p className="text-sm font-sans" style={{ color: t.bad }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-sans text-sm font-medium"
            style={{ background: t.accent, color: t.accentText }}
          >
            {loading ? '...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <button
          onClick={signInWithGoogle}
          className="w-full rounded-xl py-3 font-sans text-sm font-medium"
          style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text }}
        >
          Continuar con Google
        </button>

        <p className="text-center font-sans text-sm" style={{ color: t.text3 }}>
          {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-medium"
            style={{ color: t.accent }}
          >
            {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
