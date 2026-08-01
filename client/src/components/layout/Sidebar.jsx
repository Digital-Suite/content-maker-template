import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ navItems }) {
  const location = useLocation();

  return (
    <div className="w-64 bg-surface border-r border-border flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">Content Maker</h1>
        <p className="text-sm text-muted mt-1">AI-powered content creation engine</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === (item.path === '' ? '/' : item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted hover:text-white hover:bg-surface-raised/50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
