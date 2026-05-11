import { NavLink } from 'react-router-dom';
import { Home, List, Target, BarChart3, Settings, Users } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import Avatar from '@/components/ui/Avatar';

interface NavItem {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', Icon: Home },
  { to: '/transactions', label: 'Movimientos', Icon: List },
  { to: '/budgets', label: 'Presupuestos', Icon: Target },
  { to: '/insights', label: 'Insights', Icon: BarChart3 },
  { to: '/settings', label: 'Ajustes', Icon: Settings },
];

export default function Sidebar() {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const openModal = useModalStore((s) => s.openModal);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: t.glassSidebar,
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        borderRight: `0.5px solid ${t.border}`,
        padding: '24px 16px',
        gap: 24,
      }}
    >
      {/* Logo block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDeep} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 20,
              fontWeight: 700,
              color: t.accentText,
              lineHeight: 1,
            }}
          >
            V
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>
            VelqoraAI
          </span>
          <span style={{ fontSize: 8.5, fontWeight: 500, color: t.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Finanzas Compartidas
          </span>
        </div>
      </div>

      {/* Group switcher */}
      <button
        onClick={() => openModal('groups')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderRadius: 12,
          background: t.surface,
          border: `0.5px solid ${t.border}`,
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: t.surface2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Users size={15} color={t.text2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Mi Grupo
          </div>
          <div style={{ fontSize: 10.5, color: t.text3 }}>
            1 miembro
          </div>
        </div>
      </button>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 10,
              background: isActive ? `${t.accent}22` : 'transparent',
              border: isActive ? `1px solid ${t.accent}55` : '1px solid transparent',
              boxShadow: isActive ? `inset 3px 0 0 ${t.accent}` : 'none',
              textDecoration: 'none',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} color={isActive ? t.accent : t.text2} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? t.accent : t.text2,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User pill */}
      <div
        style={{
          paddingTop: 16,
          borderTop: `0.5px solid ${t.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Avatar initials={initials} size={34} ring />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name ?? 'Usuario'}
          </div>
          <div style={{ fontSize: 10.5, color: t.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email ?? ''}
          </div>
        </div>
      </div>
    </aside>
  );
}
