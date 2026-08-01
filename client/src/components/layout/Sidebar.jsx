import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ navItems }) {
  const location = useLocation();

  return (
    <div className="w-64 bg-[#1a1c23] border-r border-[#2e3039] flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">Content Maker</h1>
        <p className="text-sm text-[#8b8d98] mt-1">AI-powered content creation engine</p>
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
                  ? 'bg-[#10b981]/10 text-[#10b981]' 
                  : 'text-[#8b8d98] hover:text-white hover:bg-[#2e3039]/50'
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
