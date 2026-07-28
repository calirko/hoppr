import { Button } from '@/components/ui/button';

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Hoppr</h1>
      <p className="text-muted-foreground">
        Manage your AnyDesk, RustDesk, and RDP connections.
      </p>
      <Button>Add connection</Button>
    </div>
  );
}

export default App;
