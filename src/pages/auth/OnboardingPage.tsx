import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/authStore';
import { useGroupStore } from '@/stores/groupStore';
import { useModalStore } from '@/stores/modalStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import RadioCard from '@/components/ui/RadioCard';
import Eyebrow from '@/components/ui/Eyebrow';
import { ArrowRight, Wallet, Camera, Users, Sparkles, Briefcase, UserPlus, Check, List, Banknote } from 'lucide-react';
import type { Group } from '@/types';

function Logo({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const t = useTheme();
  const s = size === 'md' ? 28 : 22;
  const fs = size === 'md' ? 15 : 12;
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg flex items-center justify-center"
        style={{ width: s, height: s, background: t.accent, color: t.accentText }}>
        <span className="font-serif" style={{ fontSize: fs, fontWeight: 600 }}>V</span>
      </div>
    </div>
  );
}

const STEPS = 5;

function StepDots({ step, accent, surface3 }: { step: number; accent: string; surface3: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: STEPS }).map((_, i) => (
        <div key={i} className="rounded-full transition-all"
          style={{
            width: i === step ? 20 : 5, height: 5,
            background: i <= step ? accent : surface3,
          }} />
      ))}
    </div>
  );
}

function Frame({ children, footer, eyebrow, title, subtitle, step, accent, surface3 }: {
  children: React.ReactNode;
  footer: React.ReactNode;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  step: number;
  accent: string;
  surface3: string;
}) {
  const t = useTheme();
  const isDesktop = useIsDesktop();
  return (
    <div className="flex flex-col h-screen" style={{ background: t.bg }}>
      <div className="flex items-center justify-between" style={{ padding: isDesktop ? '24px 32px 0' : '12px 20px 0' }}>
        <Logo size="sm" />
        <StepDots step={step} accent={accent} surface3={surface3} />
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: isDesktop ? '48px 32px 24px' : '32px 24px 24px' }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="font-serif" style={{ fontSize: isDesktop ? 38 : 30, color: t.text, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.1, marginTop: 8 }}>{title}</h1>
        {subtitle && <p className="font-sans" style={{ fontSize: 13.5, color: t.text2, marginTop: 12, maxWidth: 440, lineHeight: 1.55 }}>{subtitle}</p>}
        <div style={{ marginTop: 32 }}>{children}</div>
      </div>
      <div className="shrink-0" style={{ padding: isDesktop ? '16px 32px 24px' : '12px 20px 24px', borderTop: `1px solid ${t.border}`, background: t.bgSoft }}>
        {footer}
      </div>
    </div>
  );
}

export default function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const createGroup = useGroupStore((s) => s.createGroup);
  const inviteMember = useGroupStore((s) => s.inviteMember);
  const showToast = useModalStore((s) => s.showToast);

  const [step, setStep] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<Group['type']>('family');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(false);

  const next = async () => {
    if (step === 1 && !groupName.trim()) { showToast('Poné un nombre a tu grupo', 'bad'); return; }

    if (step === 1 && !createdGroup) {
      setLoading(true);
      try {
        await createGroup(groupName, groupType);
        setCreatedGroup(true);
        setStep(2);
      } catch (err: unknown) {
        showToast((err as Error).message, 'bad');
      } finally { setLoading(false); }
      return;
    }

    if (step === 2 && inviteEmail.trim()) {
      if (!inviteEmail.includes('@')) { showToast('Email inválido', 'bad'); return; }
      setLoading(true);
      try {
        await inviteMember(inviteEmail, 'member');
        showToast(`Invitación enviada a ${inviteEmail}`, 'good');
      } catch (err: unknown) {
        showToast((err as Error).message, 'bad');
      } finally { setLoading(false); }
    }

    if (step === STEPS - 1) {
      showToast('¡Listo, todo configurado!', 'good');
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const back = () => step > 0 && setStep(step - 1);
  const skip = () => setStep(step + 1);

  const frameProps = { step, accent: t.accent, surface3: t.surface3 };

  const firstName = user?.name?.split(' ')[0] ?? '';

  if (step === 0) {
    return (
      <Frame {...frameProps} eyebrow="Paso 1 de 5"
        title={<>Hola <span style={{ fontStyle: 'italic', color: t.accent }}>{firstName}</span>.<br />Bienvenido a VelqoraAI.</>}
        subtitle="Vamos a configurar tu primer grupo en menos de un minuto. Después podés invitar a quien quieras."
        footer={<Button onClick={next} fullWidth icon={ArrowRight}>Empezar</Button>}>
        <div className="space-y-2.5" style={{ maxWidth: 460 }}>
          {[
            { I: Wallet, label: 'Tu balance unificado', desc: 'Todas las cuentas en un solo lugar, en ARS y USD.' },
            { I: Camera, label: 'Recibos automáticos', desc: 'Sacá una foto y la IA extrae monto, vendedor y categoría.' },
            { I: Users, label: 'Compartido o privado', desc: 'Cada gasto puede ser visible para todos o solo tuyo.' },
            { I: Sparkles, label: 'Asesor financiero IA', desc: 'Tips automáticos, alertas y patrones detectados.' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl" style={{ background: t.surface, border: `1px solid ${t.border}`, padding: 14 }}>
              <div className="rounded-xl flex items-center justify-center shrink-0"
                style={{ width: 38, height: 38, background: t.accent + '22', color: t.accent, border: `1px solid ${t.accent}40` }}>
                <f.I size={16} strokeWidth={1.6} />
              </div>
              <div>
                <div className="font-sans" style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>{f.label}</div>
                <div className="font-sans" style={{ fontSize: 11.5, color: t.text3, marginTop: 2, lineHeight: 1.45 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  if (step === 1) {
    return (
      <Frame {...frameProps} eyebrow="Paso 2 de 5"
        title={<>Creá tu <span style={{ fontStyle: 'italic', color: t.accent }}>primer grupo</span></>}
        subtitle="Un grupo es un espacio independiente con sus propias cuentas, presupuestos y miembros."
        footer={
          <div className="flex gap-2">
            <Button onClick={back} variant="secondary">Atrás</Button>
            <div className="flex-1"><Button onClick={next} fullWidth icon={ArrowRight} disabled={loading}>{loading ? '...' : 'Continuar'}</Button></div>
          </div>
        }>
        <div className="font-sans mb-1.5" style={{ fontSize: 11, color: t.text3, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
          Nombre del grupo
        </div>
        <Input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Ej: Familia Pérez" />

        <div style={{ marginTop: 22 }}>
          <div className="font-sans mb-1.5" style={{ fontSize: 11, color: t.text3, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
            Tipo
          </div>
          <div className="space-y-2">
            <RadioCard active={groupType === 'personal'} onClick={() => setGroupType('personal')} icon={Wallet}
              title="Personal" desc="Para tus finanzas individuales" />
            <RadioCard active={groupType === 'family'} onClick={() => setGroupType('family')} icon={Users}
              title="Familiar" desc="Compartido con pareja o familia" />
            <RadioCard active={groupType === 'business'} onClick={() => setGroupType('business')} icon={Briefcase}
              title="Negocio" desc="Para emprendimientos o equipos" />
          </div>
        </div>
      </Frame>
    );
  }

  if (step === 2) {
    return (
      <Frame {...frameProps} eyebrow="Paso 3 de 5"
        title={<>Invitá a <span style={{ fontStyle: 'italic', color: t.accent }}>alguien más</span></>}
        subtitle="Es opcional — siempre podés invitar después desde Ajustes."
        footer={
          <div className="flex gap-2">
            <Button onClick={back} variant="secondary">Atrás</Button>
            <Button onClick={skip} variant="secondary">Saltar</Button>
            <div className="flex-1"><Button onClick={next} fullWidth icon={UserPlus} disabled={loading}>{inviteEmail ? 'Invitar' : 'Continuar'}</Button></div>
          </div>
        }>
        <div className="font-sans mb-1.5" style={{ fontSize: 11, color: t.text3, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
          Email del miembro
        </div>
        <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="pareja@email.com" />
        <p className="font-sans" style={{ fontSize: 11.5, color: t.text3, marginTop: 8, lineHeight: 1.5 }}>
          Se unirá con rol <span style={{ color: t.text2, fontWeight: 500 }}>Member</span>. Podés cambiar el rol más tarde.
        </p>
      </Frame>
    );
  }

  if (step === 3) {
    return (
      <Frame {...frameProps} eyebrow="Paso 4 de 5"
        title={<>¿En qué <span style={{ fontStyle: 'italic', color: t.accent }}>moneda</span> operás?</>}
        subtitle="Podés cargar gastos en otras monedas también; VelqoraAI los convierte automáticamente."
        footer={
          <div className="flex gap-2">
            <Button onClick={back} variant="secondary">Atrás</Button>
            <div className="flex-1"><Button onClick={next} fullWidth icon={ArrowRight}>Continuar</Button></div>
          </div>
        }>
        <div className="space-y-2.5">
          {[
            { id: 'ARS' as const, flag: '🇦🇷', name: 'Peso Argentino', sub: 'ARS · con tipo de cambio blue automático' },
            { id: 'USD' as const, flag: '🇺🇸', name: 'Dólar estadounidense', sub: 'USD' },
          ].map(c => {
            const active = currency === c.id;
            return (
              <button key={c.id} onClick={() => setCurrency(c.id)}
                className="w-full flex items-center gap-3 rounded-2xl"
                style={{
                  padding: 14,
                  background: active ? t.accent + '14' : t.surface,
                  border: `1px solid ${active ? t.accent : t.border}`,
                }}>
                <span style={{ fontSize: 24, lineHeight: 1 }}>{c.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-sans" style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>{c.name}</div>
                  <div className="font-sans" style={{ fontSize: 11, color: t.text3, marginTop: 2 }}>{c.sub}</div>
                </div>
                <div className="rounded-full" style={{ width: 18, height: 18, border: `2px solid ${active ? t.accent : t.borderStrong}`, position: 'relative' }}>
                  {active && <div className="absolute" style={{ inset: 3, borderRadius: 999, background: t.accent }} />}
                </div>
              </button>
            );
          })}
        </div>
      </Frame>
    );
  }

  return (
    <Frame {...frameProps} eyebrow="Paso 5 de 5"
      title={<>Todo <span style={{ fontStyle: 'italic', color: t.accent }}>listo.</span></>}
      subtitle="Tu grupo está configurado. Cargá tu primer movimiento o escaneá un recibo para empezar."
      footer={<Button onClick={next} fullWidth icon={ArrowRight}>Entrar a VelqoraAI</Button>}>
      <div className="flex flex-col items-center" style={{ padding: '8px 0' }}>
        <div className="rounded-2xl flex items-center justify-center"
          style={{ width: 76, height: 76, background: t.income + '22', color: t.income, border: `1px solid ${t.income}40` }}>
          <Check size={36} strokeWidth={1.8} />
        </div>
      </div>

      <div className="space-y-2 mt-6" style={{ maxWidth: 460 }}>
        {[
          { l: 'Grupo', v: groupName || 'Mi grupo', I: Users },
          { l: 'Tipo', v: { personal: 'Personal', family: 'Familiar', business: 'Negocio' }[groupType], I: Briefcase },
          { l: 'Moneda', v: currency, I: Banknote },
          { l: 'Categorías', v: '13 activas', I: List },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl" style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '11px 14px' }}>
            <div className="rounded-lg flex items-center justify-center"
              style={{ width: 28, height: 28, background: t.surface2, color: t.text2 }}>
              <s.I size={13} strokeWidth={1.7} />
            </div>
            <span className="font-sans" style={{ fontSize: 12, color: t.text3, flex: 1 }}>{s.l}</span>
            <span className="font-sans" style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{s.v}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}
