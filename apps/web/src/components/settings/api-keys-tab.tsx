import {
  CheckIcon,
  CopyIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import type { ApiKey } from '@/lib/types';

export function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch<ApiKey[]>('/api-keys')
      .then(setKeys)
      .catch((error) => {
        toast.error('Failed to load API keys', {
          description: error instanceof Error ? error.message : String(error),
        });
      });
  }, []);

  async function createKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name) return;
    setCreating(true);
    try {
      const created = await apiFetch<ApiKey & { key: string }>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const { key, ...rest } = created;
      setKeys((prev) => [rest, ...(prev ?? [])]);
      setRevealedKey(key);
      setName('');
    } catch (error) {
      toast.error('Failed to create API key', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    setRevokingId(id);
    try {
      await apiFetch(`/api-keys/${id}`, { method: 'DELETE' });
      setKeys((prev) => prev?.filter((k) => k.id !== id) ?? null);
    } catch (error) {
      toast.error('Failed to revoke API key', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setRevokingId(null);
    }
  }

  async function copyKey() {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (revealedKey) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid gap-1.5">
          <Label>Your new API key</Label>
          <p className="text-muted-foreground text-sm">
            Copy this key now — you won't be able to see it again.
          </p>
        </div>
        <div className="flex gap-2">
          <Input readOnly value={revealedKey} className="font-mono text-xs" />
          <Button type="button" variant="outline" size="icon" onClick={copyKey}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>
        <Button type="button" onClick={() => setRevealedKey(null)}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={createKey} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name"
          required
        />
        <Button type="submit" disabled={creating}>
          <PlusIcon />
          Generate
        </Button>
      </form>
      <div className="flex flex-col gap-2">
        {keys?.length === 0 && (
          <p className="text-muted-foreground text-sm">No API keys yet.</p>
        )}
        {keys?.map((key) => (
          <Card key={key.id}>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <span className="text-sm">{key.name}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {key.keyPrefix}…
                </span>
              </div>
              <Button
                variant="destructive"
                size="icon-sm"
                disabled={revokingId === key.id}
                onClick={() => revoke(key.id)}
              >
                <TrashIcon />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
