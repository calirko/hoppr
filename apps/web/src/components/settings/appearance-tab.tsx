import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAutoCopyPassword } from '@/lib/settings';
import { useTheme } from '@/lib/theme';

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const { autoCopyPassword, setAutoCopyPassword } = useAutoCopyPassword();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <div className="grid gap-0.5">
          <Label htmlFor="dark-mode">Dark mode</Label>
          <p className="text-muted-foreground text-sm">
            Switch between light and dark appearance.
          </p>
        </div>
        <Switch
          id="dark-mode"
          checked={theme === 'dark'}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <div className="grid gap-0.5">
          <Label htmlFor="auto-copy-password">Auto-copy password</Label>
          <p className="text-muted-foreground text-sm">
            Copy the password to your clipboard automatically when you hit
            Connect.
          </p>
        </div>
        <Switch
          id="auto-copy-password"
          checked={autoCopyPassword}
          onCheckedChange={setAutoCopyPassword}
        />
      </div>
    </div>
  );
}
