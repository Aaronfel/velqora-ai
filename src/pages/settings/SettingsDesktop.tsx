import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useModalStore } from '@/stores/modalStore';
import { useGroupStore } from '@/stores/groupStore';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Toggle from '@/components/ui/Toggle';
import RadioCard from '@/components/ui/RadioCard';
import {
  Globe,
  DollarSign,
  Moon,
  Sun,
  Bell,
  Mail,
  Target,
  Users,
  UserPlus,
  Shield,
  LogOut,
} from 'lucide-react';

export default function SettingsDesktop() {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const openModal = useModalStore((s) => s.openModal);
  const {
    theme, setTheme,
    locale, setLocale,
    primaryCurrency, setPrimaryCurrency,
    pushEnabled, setPushEnabled,
    emailDigest, setEmailDigest,
    budgetAlerts, setBudgetAlerts,
  } = useSettingsStore();

  const activeGroup = useGroupStore((s) => s.activeGroup);
  const members = useGroupStore((s) => s.members);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const userRole = members.find((m) => m.user_id === user?.id);
  const roleBadge = userRole?.role === 'owner' ? 'Owner' : userRole?.role === 'member' ? 'Miembro' : 'Viewer';

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: t.bg, padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: t.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          Ajustes
        </div>
        <h1 className="font-serif" style={{ fontSize: 36, color: t.text, lineHeight: 1.1 }}>
          Configuración
        </h1>
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 24, alignItems: 'start' }}>

        {/* LEFT COLUMN — col-span-5 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile card */}
          <Card pad={20}>
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar initials={initials} size={72} ring />
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: t.text }}>{user?.name ?? 'Usuario'}</div>
                <div style={{ fontSize: 13, color: t.text3, marginTop: 3 }}>{user?.email ?? ''}</div>
              </div>
              <span
                className="inline-flex items-center rounded-full"
                style={{
                  padding: '4px 10px',
                  background: `${t.accent}20`,
                  color: t.accent,
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {roleBadge}
              </span>
            </div>
          </Card>

          {/* Family card */}
          <Card pad={16}>
            <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: 34, height: 34, background: t.surface2 }}
              >
                <Users size={16} color={t.text2} strokeWidth={1.6} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{activeGroup?.name ?? 'Sin grupo'}</div>
                <div style={{ fontSize: 11.5, color: t.text3 }}>{`${members.length} ${members.length === 1 ? 'miembro' : 'miembros'}`}</div>
              </div>
            </div>

            {/* Members list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {members.map((m) => {
                const name = m.user?.name ?? 'Sin nombre';
                const mi = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                const roleLabel = m.role === 'owner' ? 'Owner' : m.role === 'member' ? 'Miembro' : 'Viewer';
                return (
                  <div key={m.user_id} className="flex items-center gap-2">
                    <Avatar initials={mi} size={28} />
                    <div>
                      <div style={{ fontSize: 12.5, color: t.text, fontWeight: 500 }}>{name}</div>
                      <div style={{ fontSize: 11, color: t.text3 }}>{roleLabel}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => openModal('invite')}
                className="flex items-center gap-2 w-full rounded-xl"
                style={{
                  padding: '10px 14px',
                  background: t.surface2,
                  border: `1px solid ${t.border}`,
                  fontSize: 13,
                  color: t.text,
                  fontWeight: 500,
                }}
              >
                <UserPlus size={14} color={t.text2} strokeWidth={1.6} />
                Invitar miembro
              </button>
              <button
                onClick={() => openModal('roles')}
                className="flex items-center gap-2 w-full rounded-xl"
                style={{
                  padding: '10px 14px',
                  background: t.surface2,
                  border: `1px solid ${t.border}`,
                  fontSize: 13,
                  color: t.text,
                  fontWeight: 500,
                }}
              >
                <Shield size={14} color={t.text2} strokeWidth={1.6} />
                Gestionar roles
              </button>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN — col-span-7 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Preferences card */}
          <Card pad={20}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 18 }}>Preferencias</div>

            {/* Language */}
            <div style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                <Globe size={14} color={t.text3} strokeWidth={1.6} />
                <span style={{ fontSize: 12.5, color: t.text2, fontWeight: 500 }}>Idioma</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <RadioCard
                    active={locale === 'es'}
                    title="Español"
                    onClick={() => setLocale('es')}
                  />
                </div>
                <div className="flex-1">
                  <RadioCard
                    active={locale === 'en'}
                    title="English"
                    onClick={() => setLocale('en')}
                  />
                </div>
              </div>
            </div>

            {/* Currency */}
            <div style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                <DollarSign size={14} color={t.text3} strokeWidth={1.6} />
                <span style={{ fontSize: 12.5, color: t.text2, fontWeight: 500 }}>Moneda principal</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <RadioCard
                    active={primaryCurrency === 'ARS'}
                    title="ARS"
                    desc="Peso argentino"
                    onClick={() => setPrimaryCurrency('ARS')}
                  />
                </div>
                <div className="flex-1">
                  <RadioCard
                    active={primaryCurrency === 'USD'}
                    title="USD"
                    desc="Dólar estadounidense"
                    onClick={() => setPrimaryCurrency('USD')}
                  />
                </div>
              </div>
            </div>

            {/* Theme */}
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                {theme === 'dark' ? <Moon size={14} color={t.text3} strokeWidth={1.6} /> : <Sun size={14} color={t.text3} strokeWidth={1.6} />}
                <span style={{ fontSize: 12.5, color: t.text2, fontWeight: 500 }}>Tema</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <RadioCard
                    active={theme === 'dark'}
                    title="Oscuro"
                    icon={Moon}
                    onClick={() => setTheme('dark')}
                  />
                </div>
                <div className="flex-1">
                  <RadioCard
                    active={theme === 'light'}
                    title="Claro"
                    icon={Sun}
                    onClick={() => setTheme('light')}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications card */}
          <Card pad={20}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 16 }}>Notificaciones</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{ width: 32, height: 32, background: t.surface2 }}
                >
                  <Bell size={14} color={t.text2} strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>Notificaciones push</div>
                </div>
                <Toggle checked={pushEnabled} onChange={setPushEnabled} />
              </div>

              <div style={{ height: 1, background: t.border }} />

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{ width: 32, height: 32, background: t.surface2 }}
                >
                  <Mail size={14} color={t.text2} strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>Resumen por email</div>
                  <div style={{ fontSize: 11, color: t.text3, marginTop: 2 }}>
                    {emailDigest === 'off' ? 'Desactivado' : emailDigest === 'weekly' ? 'Semanal' : 'Mensual'}
                  </div>
                </div>
                <Toggle checked={emailDigest !== 'off'} onChange={(val) => setEmailDigest(val ? 'weekly' : 'off')} />
              </div>

              <div style={{ height: 1, background: t.border }} />

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{ width: 32, height: 32, background: t.surface2 }}
                >
                  <Target size={14} color={t.text2} strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>Alertas de presupuesto</div>
                </div>
                <Toggle checked={budgetAlerts} onChange={setBudgetAlerts} />
              </div>
            </div>
          </Card>

          {/* Account card */}
          <Card pad={16}>
            <button
              onClick={() => openModal('signout')}
              className="flex items-center gap-3 w-full rounded-xl"
              style={{
                padding: '12px 14px',
                background: `${t.bad}10`,
                border: `1px solid ${t.bad}30`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 32, height: 32, background: `${t.bad}15` }}
              >
                <LogOut size={14} color={t.bad} strokeWidth={1.6} />
              </div>
              <span style={{ fontSize: 13.5, color: t.bad, fontWeight: 500 }}>Cerrar sesión</span>
            </button>
          </Card>

        </div>
      </div>
    </div>
  );
}
