import { NavLink } from 'react-router-dom';
import { Home, List, Target, BarChart3, Settings } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface TabItem {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

const TABS: TabItem[] = [
  { to: '/', label: 'Inicio', Icon: Home },
  { to: '/transactions', label: 'Movim.', Icon: List },
  { to: '/budgets', label: 'Presup.', Icon: Target },
  { to: '/insights', label: 'Insights', Icon: BarChart3 },
  { to: '/settings', label: 'Ajustes', Icon: Settings },
];

export default function TabBar() {
  const t = useTheme();

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '6px 8px',
        background: t.glassStrong,
        backdropFilter: 'blur(40px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
        borderRadius: 30,
        border: `0.5px solid ${t.border}`,
        boxShadow: `0 8px 28px -4px ${t.shadow}, 0 1px 0 0 ${t.glassEdgeStrong} inset, 0 -1px 0 0 ${t.glassDivider} inset`,
        zIndex: 50,
      }}
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '6px 12px',
            borderRadius: 22,
            background: isActive ? `${t.accent}24` : 'transparent',
            textDecoration: 'none',
            transition: 'background 0.18s ease',
            minWidth: 52,
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={19} color={isActive ? t.accent : t.text2} />
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? t.accent : t.text3,
                  letterSpacing: '0.01em',
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
