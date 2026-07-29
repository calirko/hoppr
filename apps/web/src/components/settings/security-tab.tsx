import { DesktopIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { Session } from '@/lib/types';

export function SecurityTab() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Session[]>('/sessions')
      .then(setSessions)
      .catch((error) => {
        toast.error('Failed to load sessions', {
          description: error instanceof Error ? error.message : String(error),
        });
      });
  }, []);

  async function revoke(id: string) {
    setRevokingId(id);
    try {
      await apiFetch(`/sessions/${id}`, { method: 'DELETE' });
      setSessions((prev) => prev?.filter((s) => s.id !== id) ?? null);
    } catch (error) {
      toast.error('Failed to revoke session', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setRevokingId(null);
    }
  }

  if (!sessions) {
    return <p className="text-muted-foreground text-sm">Loading sessions…</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DesktopIcon size={20} className="text-muted-foreground" />
              <div className="grid gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {session.userAgent ?? 'Unknown device'}
                  </span>
                  {session.isCurrent && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                <span className="text-muted-foreground text-xs">
                  {session.ip ?? 'Unknown IP'} · signed in{' '}
                  {new Date(session.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={session.isCurrent || revokingId === session.id}
              onClick={() => revoke(session.id)}
            >
              Revoke
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
