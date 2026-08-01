import { Outlet } from 'react-router-dom';
import { useDigitalSuite } from '../../hooks/useDigitalSuite';
import { Sidebar } from './Sidebar';

const APP_NAVIGATION = [
  { id: 'create', label: 'Create Video', path: '' },
  { id: 'videos', label: 'My Videos', path: 'videos' },
];

export function AppShell() {
  const { isEmbedded } = useDigitalSuite(APP_NAVIGATION);

  return (
    <div className="flex h-screen bg-[#0f1014] text-[#e2e4e9]">
      {!isEmbedded && <Sidebar navItems={APP_NAVIGATION} />}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
