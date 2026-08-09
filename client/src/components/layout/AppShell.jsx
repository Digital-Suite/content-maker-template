import { Outlet } from 'react-router-dom';
import { useDigitalSuite } from '../../hooks/useDigitalSuite';
import { Sidebar } from './Sidebar';

const APP_NAVIGATION = [
  { id: 'create', label: 'Create Video', path: '' },
  { id: 'videos', label: 'My Videos', path: 'videos' },
  { id: 'keys', label: 'Settings & Keys', path: 'keys' },
];

export function AppShell() {
  const { isEmbedded } = useDigitalSuite(APP_NAVIGATION);

  return (
    <div className="flex h-screen bg-bg text-text">
      {!isEmbedded && <Sidebar navItems={APP_NAVIGATION} />}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
