import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useModalStore } from '@/stores/modalStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Check, Camera, Users, Sparkles, PiggyBank } from 'lucide-react';

function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const t = useTheme();
  const s = size === 'lg' ? 38 : size === 'md' ? 28 : 22;
  const fs = size === 'lg' ? 20 : size === 'md' ? 15 : 12;
  return (
    <div className="flex items-center gap-2.5">
      <div className="rounded-lg flex items-center justify-center"
        style={{ width: s, height: s, background: t.accent, color: t.accentText }}>
        <span className="font-serif" style={{ fontSize: fs, fontWeight: 600 }}>V</span>
      </div>
      {size !== 'sm' && (
        <div>
          <div className="font-serif" style={{ fontSize: fs + 1, color: t.text, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1 }}>VelqoraAI</div>
          <div className="font-sans" style={{ fontSize: 9, color: t.text3, letterSpacing: '0.15em', marginTop: 2 }}>FINANZAS COMPARTIDAS</div>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <div className="font-sans mb-1.5" style={{ fontSize: 11, color: t.text3, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthStore();
  const showToast = useModalStore((s) => s.showToast);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : password.length < 14 ? 3 : 4;
  const strengthLabel = ['', 'Débil', 'Aceptable', 'Buena', 'Excelente'][strength];
  const strengthColor = strength <= 1 ? t.bad : strength === 2 ? t.warn : t.income;

  const handleLogin = async () => {
    if (!email.includes('@')) { showToast('Email inválido', 'bad'); return; }
    if (password.length < 6) { showToast('Contraseña muy corta', 'bad'); return; }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      showToast('Bienvenido de vuelta', 'good');
    } catch (err: unknown) {
      showToast((err as Error).message, 'bad');
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!name.trim()) { showToast('Poné tu nombre', 'bad'); return; }
    if (!email.includes('@')) { showToast('Email inválido', 'bad'); return; }
    if (password.length < 6) { showToast('Contraseña muy corta', 'bad'); return; }
    if (!terms) { showToast('Aceptá los términos', 'bad'); return; }
    setLoading(true);
    try {
      const { confirmEmail } = await signUpWithEmail(email, password, name);
      if (confirmEmail) {
        showToast('Revisá tu email para confirmar tu cuenta', 'neutral');
        setMode('login');
      } else {
        showToast(`¡Bienvenido, ${name.split(' ')[0]}!`, 'good');
      }
    } catch (err: unknown) {
      showToast((err as Error).message, 'bad');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    showToast('Conectando con Google...', 'neutral');
    try { await signInWithGoogle(); } catch (err: unknown) { showToast((err as Error).message, 'bad'); }
  };

  const LoginForm = (
    <div className="flex flex-col" style={{ padding: isDesktop ? '40px 48px' : '32px 24px', width: '100%', maxWidth: isDesktop ? 420 : '100%' }}>
      <Logo size="md" />
      <h1 className="font-serif" style={{ fontSize: isDesktop ? 34 : 28, color: t.text, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 32, lineHeight: 1.1 }}>
        Bienvenido <br /><span style={{ fontStyle: 'italic', color: t.text2 }}>de vuelta</span>
      </h1>
      <p className="font-sans" style={{ fontSize: 13, color: t.text3, marginTop: 10, lineHeight: 1.5 }}>
        Entrá a tu cuenta para seguir gestionando las finanzas.
      </p>

      <div style={{ marginTop: 28 }}>
        <FieldLabel>Email</FieldLabel>
        <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@email.com" />
      </div>
      <div style={{ marginTop: 14 }}>
        <FieldLabel>Contraseña</FieldLabel>
        <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
      </div>
      <button onClick={() => showToast('Email enviado para resetear', 'neutral')}
        className="self-end mt-2 font-sans" style={{ fontSize: 11.5, color: t.accent, fontWeight: 500 }}>
        ¿Olvidaste tu contraseña?
      </button>

      <div style={{ marginTop: 22 }}>
        <Button onClick={handleLogin} fullWidth disabled={loading}>
          {loading ? '...' : 'Iniciar sesión'}
        </Button>
      </div>

      <div className="flex items-center gap-3" style={{ margin: '22px 0 16px' }}>
        <div className="flex-1 h-px" style={{ background: t.border }} />
        <span className="font-sans" style={{ fontSize: 10, color: t.text3, letterSpacing: '0.18em' }}>O CONTINUÁ CON</span>
        <div className="flex-1 h-px" style={{ background: t.border }} />
      </div>

      <button onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-sans"
        style={{ padding: 13, background: t.surface, border: `1px solid ${t.border}`, fontSize: 13.5, color: t.text, fontWeight: 500 }}>
        <GoogleIcon size={16} /> Continuar con Google
      </button>

      <div className="text-center" style={{ marginTop: 28 }}>
        <span className="font-sans" style={{ fontSize: 12.5, color: t.text3 }}>¿Primera vez? </span>
        <button onClick={() => setMode('signup')} className="font-sans" style={{ fontSize: 12.5, color: t.accent, fontWeight: 600 }}>
          Crear cuenta
        </button>
      </div>
    </div>
  );

  const SignupForm = (
    <div className="flex flex-col" style={{ padding: isDesktop ? '40px 48px' : '32px 24px', width: '100%', maxWidth: isDesktop ? 440 : '100%' }}>
      <Logo size="md" />
      <h1 className="font-serif" style={{ fontSize: isDesktop ? 34 : 28, color: t.text, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 32, lineHeight: 1.1 }}>
        Empezá <span style={{ fontStyle: 'italic', color: t.text2 }}>ahora</span>
      </h1>
      <p className="font-sans" style={{ fontSize: 13, color: t.text3, marginTop: 10, lineHeight: 1.5 }}>
        Tu primera familia y categorías quedan listas en menos de un minuto.
      </p>

      <div style={{ marginTop: 24 }}>
        <FieldLabel>Nombre</FieldLabel>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Aaron Pérez" />
      </div>
      <div style={{ marginTop: 14 }}>
        <FieldLabel>Email</FieldLabel>
        <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@email.com" />
      </div>
      <div style={{ marginTop: 14 }}>
        <FieldLabel>Contraseña</FieldLabel>
        <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" />
        <div className="flex items-center gap-1.5 mt-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i <= strength ? strengthColor : t.surface3 }} />
          ))}
          {strength > 0 && <span className="font-sans" style={{ fontSize: 10.5, color: strengthColor, marginLeft: 6, fontWeight: 500 }}>{strengthLabel}</span>}
        </div>
      </div>

      <button onClick={() => setTerms(!terms)} className="flex items-start gap-2.5 text-left" style={{ marginTop: 18 }}>
        <div className="rounded-md shrink-0 flex items-center justify-center mt-0.5"
          style={{ width: 16, height: 16, background: terms ? t.accent : 'transparent', border: `1.5px solid ${terms ? t.accent : t.borderStrong}` }}>
          {terms && <Check size={11} color={t.accentText} strokeWidth={3} />}
        </div>
        <span className="font-sans" style={{ fontSize: 11.5, color: t.text2, lineHeight: 1.5 }}>
          Acepto los <span style={{ color: t.accent, fontWeight: 500 }}>Términos</span> y la <span style={{ color: t.accent, fontWeight: 500 }}>Política de Privacidad</span>.
        </span>
      </button>

      <div style={{ marginTop: 22 }}>
        <Button onClick={handleSignup} fullWidth disabled={loading}>
          {loading ? '...' : 'Crear cuenta'}
        </Button>
      </div>

      <div className="flex items-center gap-3" style={{ margin: '18px 0 14px' }}>
        <div className="flex-1 h-px" style={{ background: t.border }} />
        <span className="font-sans" style={{ fontSize: 10, color: t.text3, letterSpacing: '0.18em' }}>O</span>
        <div className="flex-1 h-px" style={{ background: t.border }} />
      </div>

      <button onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-sans"
        style={{ padding: 13, background: t.surface, border: `1px solid ${t.border}`, fontSize: 13.5, color: t.text, fontWeight: 500 }}>
        <GoogleIcon size={16} /> Registrarse con Google
      </button>

      <div className="text-center" style={{ marginTop: 24 }}>
        <span className="font-sans" style={{ fontSize: 12.5, color: t.text3 }}>¿Ya tenés cuenta? </span>
        <button onClick={() => setMode('login')} className="font-sans" style={{ fontSize: 12.5, color: t.accent, fontWeight: 600 }}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );

  const FormCard = mode === 'login' ? LoginForm : SignupForm;

  if (!isDesktop) {
    return (
      <div className="flex flex-col h-screen overflow-y-auto" style={{ background: t.bg }}>
        {FormCard}
      </div>
    );
  }

  const isSignup = mode === 'signup';
  return (
    <div className="flex" style={{ minHeight: '100vh', background: t.bg }}>
      <div className="relative flex flex-col justify-between overflow-hidden"
        style={{ width: '52%', padding: 48, background: `linear-gradient(135deg, ${t.surface} 0%, ${t.bg} 100%)`, borderRight: `1px solid ${t.border}` }}>
        <Logo size="lg" />
        <div className="relative">
          <h2 className="font-serif" style={{ fontSize: 52, color: t.text, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            {isSignup ? (
              <>Empezá <span style={{ fontStyle: 'italic', color: t.accent }}>en serio.</span><br />
              Tomá el control <span style={{ fontStyle: 'italic', color: t.accent }}>hoy.</span></>
            ) : (
              <>Plata <span style={{ fontStyle: 'italic', color: t.accent }}>compartida.</span><br />
              Decisiones <span style={{ fontStyle: 'italic', color: t.accent }}>juntos.</span></>
            )}
          </h2>
          {isSignup ? (
            <div className="space-y-3 mt-8" style={{ maxWidth: 380 }}>
              {[
                { I: Camera, label: 'Escaneá recibos con IA' },
                { I: Users, label: 'Compartí con tu familia o pareja' },
                { I: Sparkles, label: 'Tips automáticos del asesor IA' },
                { I: PiggyBank, label: 'Metas de ahorro con seguimiento' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="rounded-lg flex items-center justify-center"
                    style={{ width: 30, height: 30, background: t.accent + '22', color: t.accent, border: `1px solid ${t.accent}40` }}>
                    <f.I size={14} strokeWidth={1.7} />
                  </div>
                  <span className="font-sans" style={{ fontSize: 13, color: t.text2 }}>{f.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-sans" style={{ fontSize: 14, color: t.text2, marginTop: 20, maxWidth: 380, lineHeight: 1.55 }}>
              La app que unifica los gastos del hogar con IA para extraer recibos, sugerir límites y mantener todo sincronizado en tiempo real.
            </p>
          )}
        </div>
        <div className="flex items-center gap-6 font-sans" style={{ fontSize: 11, color: t.text3 }}>
          {isSignup ? (
            <span>Gratis hasta 100 movimientos/mes</span>
          ) : (
            <>
              <span>v0.4.2</span>
              <span>·</span>
              <span>Hecho en Buenos Aires</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {FormCard}
      </div>
    </div>
  );
}
