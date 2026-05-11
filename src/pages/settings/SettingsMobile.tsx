import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useModalStore } from '@/stores/modalStore';
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
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick?: () => void;
  last?: boolean;
}

function SettingRow({ icon: Icon, label, value, onClick, last }: SettingRowProps) {
  const t = useTheme();
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 text-left"
      style={{
        padding: '14px 16px',
        borderBottom: last ? 'none' : `1px solid ${t.border}`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg shrink-0"
        style={{ width: 32, height: 32, background: t.surface2 }}
      >
        <Icon size={15} color={t.text2} strokeWidth={1.6} />
      </div>
      <span className="flex-1" style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>
        {label}
      </span>
      {value && (
        <span style={{ fontSize: 12, color: t.text3 }}>{value}</span>
      )}
      <ChevronRight size={14} color={t.text3} strokeWidth={1.8} />
    </button>
  );
}

interface ToggleRowProps {
  icon: LucideIcon;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  last?: boolean;
}

function ToggleRow({ icon: Icon, label, hint, checked, onChange, last }: ToggleRowProps) {
  const t = useTheme();
  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: '14px 16px',
        borderBottom: last ? 'none' : `1px solid ${t.border}`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg shrink-0"
        style={{ width: 32, height: 32, background: t.surface2 }}
      >
        <Icon size={15} color={t.text2} strokeWidth={1.6} />
      </div>
      <div className="flex-1">
        <div style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: t.text3, marginTop: 2 }}>{hint}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function SettingsMobile() {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const openModal = useModalStore((s) => s.openModal);
  const {
    theme, setTheme,
    locale,
    primaryCurrency,
    pushEnabled, setPushEnabled,
    emailDigest, setEmailDigest,
    budgetAlerts, setBudgetAlerts,
  } = useSettingsStore();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex flex-col h-full" style={{ background: t.bg }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 8px' }}>
        <h1 className="font-serif" style={{ fontSize: 28, color: t.text, lineHeight: 1.1 }}>
          Ajustes
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 16px', paddingBottom: 112 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 16 }}>

          {/* Profile card */}
          <Card pad={16}>
            <div className="flex items-center gap-3">
              <Avatar initials={initials} size={56} ring />
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>{user?.name ?? 'Usuario'}</div>
                <div style={{ fontSize: 12, color: t.text3, marginTop: 2 }}>{user?.email ?? ''}</div>
              </div>
              <span
                className="inline-flex items-center rounded-full shrink-0"
                style={{
                  padding: '3px 8px',
                  background: `${t.accent}20`,
                  color: t.accent,
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Owner
              </span>
            </div>
          </Card>

          {/* Family card */}
          <Card pad={0}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}` }}>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 32, height: 32, background: t.surface2 }}
                >
                  <Users size={15} color={t.text2} strokeWidth={1.6} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: t.text }}>Casa Pérez</div>
                  <div style={{ fontSize: 11, color: t.text3, marginTop: 1 }}>3 miembros</div>
                </div>
              </div>
            </div>
            <SettingRow
              icon={UserPlus}
              label="Invitar miembro"
              onClick={() => openModal('invite')}
            />
            <SettingRow
              icon={Shield}
              label="Gestionar roles"
              onClick={() => openModal('roles')}
              last
            />
          </Card>

          {/* Preferences section */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              Preferencias
            </div>
            <Card pad={0}>
              <SettingRow
                icon={Globe}
                label="Idioma"
                value={locale === 'es' ? 'Español' : 'English'}
              />
              <SettingRow
                icon={DollarSign}
                label="Moneda principal"
                value={primaryCurrency}
              />
              {/* Theme */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 13, color: t.text2, fontWeight: 500, marginBottom: 10 }}>Tema</div>
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
          </div>

          {/* Notifications section */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              Notificaciones
            </div>
            <Card pad={0}>
              <ToggleRow
                icon={Bell}
                label="Notificaciones push"
                checked={pushEnabled}
                onChange={setPushEnabled}
              />
              <ToggleRow
                icon={Mail}
                label="Resumen por email"
                hint={emailDigest === 'off' ? 'Desactivado' : emailDigest === 'weekly' ? 'Semanal' : 'Mensual'}
                checked={emailDigest !== 'off'}
                onChange={(val) => setEmailDigest(val ? 'weekly' : 'off')}
              />
              <ToggleRow
                icon={Target}
                label="Alertas de presupuesto"
                checked={budgetAlerts}
                onChange={setBudgetAlerts}
                last
              />
            </Card>
          </div>

          {/* Danger zone */}
          <div>
            <Card pad={0}>
              <button
                onClick={() => openModal('signout')}
                className="w-full flex items-center gap-3 text-left"
                style={{ padding: '14px 16px' }}
              >
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{ width: 32, height: 32, background: `${t.bad}15` }}
                >
                  <LogOut size={15} color={t.bad} strokeWidth={1.6} />
                </div>
                <span style={{ fontSize: 13.5, color: t.bad, fontWeight: 500 }}>Cerrar sesión</span>
              </button>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
