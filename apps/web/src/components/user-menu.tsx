import { GearIcon, SignOutIcon, UserCircleIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiFetch } from '@/lib/api';
import { clearToken, fetchMe, getCurrentUser } from '@/lib/auth';

export function UserMenu() {
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(
    getCurrentUser()?.name ?? getCurrentUser()?.email ?? null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (name) return;
    fetchMe().then(() => {
      const user = getCurrentUser();
      if (user) setName(user.name ?? user.email);
    });
  }, [name]);

  function handleLogout() {
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    clearToken();
    navigate('/login');
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="h-full gap-2 px-2">
              <UserCircleIcon size={20} />
              <span className="hidden sm:inline">{name ?? 'Account'}</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{name ?? 'Account'}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <GearIcon />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <SignOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
