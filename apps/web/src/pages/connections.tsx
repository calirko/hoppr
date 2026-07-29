import {
  CopyIcon,
  DesktopIcon,
  DesktopTowerIcon,
  DotsThreeIcon,
  MagnifyingGlassIcon,
  MonitorIcon,
  PencilIcon,
  PlugIcon,
  PlusIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  TrashIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ConnectionDialog } from '@/components/connection-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { VpnDialog } from '@/components/vpn-dialog';
import { apiFetch } from '@/lib/api';
import { launchConnection } from '@/lib/launch';
import { getAutoCopyPassword } from '@/lib/settings';
import type { Connection } from '@/lib/types';

const SEARCH_DEBOUNCE_MS = 200;

const TYPE_LABEL: Record<Connection['type'], string> = {
  ANYDESK: 'AnyDesk',
  RUSTDESK: 'RustDesk',
  RDP: 'RDP',
};

const TYPE_ICON: Record<Connection['type'], typeof DesktopIcon> = {
  ANYDESK: DesktopIcon,
  RUSTDESK: DesktopTowerIcon,
  RDP: MonitorIcon,
};

const HIGHLIGHT_PARAM = 'highlight';
const HIGHLIGHT_DURATION_MS = 2100;

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Connection | null>(null);
  const [deleting, setDeleting] = useState<Connection | null>(null);
  const [viewingVpn, setViewingVpn] = useState<Connection | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const hasAppliedHighlightRef = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isAnyDialogOpen =
    dialogOpen || Boolean(deleting) || Boolean(viewingVpn);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isAnyDialogOpen) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isEditable) return;

      if (event.key === 'Escape') return;

      if (event.key.length === 1) {
        searchInputRef.current?.focus();
      } else if (event.key === 'Backspace') {
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isAnyDialogOpen]);

  const filteredConnections = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const filtered = query
      ? connections.filter((connection) => {
          const haystack = [
            connection.label,
            connection.host,
            connection.username,
            connection.domain,
            connection.notes,
            connection.port?.toString(),
            TYPE_LABEL[connection.type],
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(query);
        })
      : connections;

    return [...filtered].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
    );
  }, [connections, debouncedSearch]);

  async function load() {
    setLoading(true);
    try {
      const items = await apiFetch<Connection[]>('/connections');
      setConnections(items);
    } catch (error) {
      toast.error('Failed to load connections', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (loading || hasAppliedHighlightRef.current) return;
    const targetId = searchParams.get(HIGHLIGHT_PARAM);
    if (!targetId) return;
    const card = cardRefs.current.get(targetId);
    if (!card) return;

    hasAppliedHighlightRef.current = true;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedId(targetId);

    const clearTimer = setTimeout(() => {
      setHighlightedId(null);
    }, HIGHLIGHT_DURATION_MS);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(HIGHLIGHT_PARAM);
        return next;
      },
      { replace: true },
    );

    return () => clearTimeout(clearTimer);
  }, [loading, searchParams, setSearchParams]);

  async function shareConnection(connection: Connection) {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set(HIGHLIGHT_PARAM, connection.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      toast.success('Share link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy share link', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(connection: Connection) {
    setEditing(connection);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await apiFetch(`/connections/${deleting.id}`, { method: 'DELETE' });
      toast.success('Connection deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error('Failed to delete connection', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function connect(connection: Connection) {
    if (getAutoCopyPassword() && connection.password) {
      try {
        await navigator.clipboard.writeText(connection.password);
      } catch (error) {
        toast.error('Failed to copy password', {
          description: error instanceof Error ? error.message : String(error),
        });
      }
    }
    try {
      await apiFetch(`/connections/${connection.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ lastLaunchedAt: new Date().toISOString() }),
      });
      load();
    } catch (error) {
      toast.error('Failed to launch connection', {
        description: error instanceof Error ? error.message : String(error),
      });
      return;
    }
    launchConnection(connection);
  }

  async function copyPassword(connection: Connection) {
    if (!connection.password) {
      toast.error('No password saved for this connection');
      return;
    }
    try {
      await navigator.clipboard.writeText(connection.password);
      toast.success('Password copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy password', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl">Connections</h1>
          <p className="text-sm text-muted-foreground">
            Saved remote-access endpoints you can launch.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <MagnifyingGlassIcon
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search connections..."
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                searchInputRef.current?.focus();
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
        {/*<Button onClick={openCreate}>
          <PlusIcon />
          New connection
        </Button>*/}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <button
          type="button"
          onClick={openCreate}
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/15 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <PlusIcon size={28} />
          <span className="text-sm font-medium">New connection</span>
        </button>

        {!loading &&
          filteredConnections.map((connection) => {
            const TypeIcon = TYPE_ICON[connection.type];
            return (
              <Card
                key={connection.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(connection.id, el);
                  else cardRefs.current.delete(connection.id);
                }}
                className={
                  highlightedId === connection.id
                    ? 'min-h-40 animate-highlight-blink'
                    : 'min-h-40'
                }
              >
                <CardHeader>
                  <CardTitle className="truncate">{connection.label}</CardTitle>
                  <CardAction className="flex items-center gap-1.5">
                    {connection.isVpnRequired && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <ShieldCheckIcon size={16} />
                            </span>
                          }
                        />
                        <TooltipContent>Requires VPN</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <TypeIcon size={16} />
                          </span>
                        }
                      />
                      <TooltipContent>
                        {TYPE_LABEL[connection.type]}
                      </TooltipContent>
                    </Tooltip>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-1 text-sm text-muted-foreground">
                  <div className="truncate">
                    <span className="text-foreground/70">Host:</span>{' '}
                    {connection.host}
                    {connection.port ? `:${connection.port}` : ''}
                  </div>
                  <div className="truncate">
                    <span className="text-foreground/70">User:</span>{' '}
                    {connection.username ?? '-'}
                  </div>
                  <div className="truncate">
                    <span className="text-foreground/70">Last used:</span>{' '}
                    {connection.lastLaunchedAt
                      ? new Date(connection.lastLaunchedAt).toLocaleString()
                      : 'Never'}
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => connect(connection)}>
                      <PlugIcon />
                      Connect
                    </Button>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => copyPassword(connection)}
                          >
                            <CopyIcon size={16} />
                          </Button>
                        }
                      />
                      <TooltipContent>Copy password</TooltipContent>
                    </Tooltip>
                    {connection.isVpnRequired && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => setViewingVpn(connection)}
                            >
                              <ShieldCheckIcon size={16} />
                            </Button>
                          }
                        />
                        <TooltipContent>VPN details</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <DotsThreeIcon size={18} />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(connection)}>
                        <PencilIcon />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => shareConnection(connection)}
                      >
                        <ShareNetworkIcon />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleting(connection)}
                      >
                        <TrashIcon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            );
          })}
      </div>

      <ConnectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        connection={editing}
        onSaved={load}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete connection"
        description={`This will permanently delete "${deleting?.label}". This cannot be undone.`}
        onConfirm={confirmDelete}
      />
      <VpnDialog
        open={Boolean(viewingVpn)}
        onOpenChange={(open) => !open && setViewingVpn(null)}
        connection={viewingVpn}
      />
    </div>
  );
}
