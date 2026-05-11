import { useIsDesktop } from '@/hooks/useMediaQuery';
import SettingsMobile from './SettingsMobile';
import SettingsDesktop from './SettingsDesktop';

export default function SettingsPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <SettingsDesktop /> : <SettingsMobile />;
}
