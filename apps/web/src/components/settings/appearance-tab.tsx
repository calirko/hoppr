import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/lib/theme';

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
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
  );
}
