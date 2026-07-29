import { ListIcon, PlugsIcon, UsersIcon, XIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/user-menu';
import { useIsMobile } from '@/hooks/use-mobile';

const NAV_ITEMS = [
  { label: 'Connections', path: '/connections', icon: <PlugsIcon /> },
  { label: 'Users', path: '/users', icon: <UsersIcon /> },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 h-14 w-full border-b bg-background">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full">
          <div className="flex h-full items-center border-r p-2">
            <img src="/hoppr.svg" alt="Hoppr" className="h-full" />
          </div>
          {isMobile ? (
            <div className="flex h-full items-center px-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <XIcon size={20} /> : <ListIcon size={20} />}
              </Button>
            </div>
          ) : (
            <div className="flex h-full items-center">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.path}
                  className={`flex h-full items-center border-r ${
                    location.pathname.startsWith(item.path)
                      ? ''
                      : 'text-muted-foreground'
                  }`}
                >
                  <Button
                    variant="ghost"
                    className="m-0! h-full rounded-none! px-4"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="h-full border-l p-2">
          <UserMenu />
        </div>
      </div>

      {isMobile && menuOpen && (
        <div className="absolute top-14 left-0 z-50 w-full border-b bg-background shadow-md">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.path}
              className={`flex w-full items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0 hover:bg-muted transition-colors ${
                location.pathname.startsWith(item.path)
                  ? 'font-medium'
                  : 'text-muted-foreground'
              }`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
