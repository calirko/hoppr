import { FloppyDiskIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import type { ClientType, Connection } from '@/lib/types';

const CLIENT_TYPES: { value: ClientType; label: string }[] = [
  { value: 'ANYDESK', label: 'AnyDesk' },
  { value: 'RUSTDESK', label: 'RustDesk' },
  { value: 'RDP', label: 'RDP' },
];

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: Connection | null;
  onSaved: () => void;
}

const EMPTY_FORM = {
  type: 'ANYDESK' as ClientType,
  label: '',
  host: '',
  port: '',
  username: '',
  password: '',
  domain: '',
  notes: '',
  isVpnRequired: false,
  vpnFileName: '',
  vpnFileContent: '',
  vpnUsername: '',
  vpnPassword: '',
  vpnEncryptionKey: '',
};

export function ConnectionDialog({
  open,
  onOpenChange,
  connection,
  onSaved,
}: ConnectionDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(connection);
  const isRdp = form.type === 'RDP';

  useEffect(() => {
    if (!open) return;
    setForm(
      connection
        ? {
            type: connection.type,
            label: connection.label,
            host: connection.host,
            port: connection.port?.toString() ?? '',
            username: connection.username ?? '',
            password: connection.password ?? '',
            domain: connection.domain ?? '',
            notes: connection.notes ?? '',
            isVpnRequired: connection.isVpnRequired,
            vpnFileName: connection.vpn?.fileName ?? '',
            vpnFileContent: connection.vpn?.fileContent ?? '',
            vpnUsername: connection.vpn?.username ?? '',
            vpnPassword: connection.vpn?.password ?? '',
            vpnEncryptionKey: connection.vpn?.encryptionKey ?? '',
          }
        : EMPTY_FORM,
    );
  }, [open, connection]);

  async function onVpnFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      setForm((f) => ({
        ...f,
        vpnFileName: file.name,
        vpnFileContent: content,
      }));
    } catch (error) {
      toast.error('Failed to read VPN file', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      e.target.value = '';
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.label || !form.host) {
      toast.error('Label and host are required');
      return;
    }
    if (isRdp && form.isVpnRequired && !form.vpnFileContent) {
      toast.error('A VPN file is required when VPN is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type: form.type,
        label: form.label,
        host: form.host,
        port: isRdp && form.port ? Number(form.port) : null,
        username: isRdp ? form.username || null : null,
        password: form.password || null,
        domain: isRdp ? form.domain || null : null,
        notes: form.notes || null,
        isVpnRequired: isRdp && form.isVpnRequired,
        vpn:
          isRdp && form.isVpnRequired
            ? {
                fileName: form.vpnFileName,
                fileContent: form.vpnFileContent,
                username: form.vpnUsername || null,
                password: form.vpnPassword || null,
                encryptionKey: form.vpnEncryptionKey || null,
              }
            : null,
      };

      if (isEdit && connection) {
        await apiFetch(`/connections/${connection.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Connection updated');
      } else {
        await apiFetch('/connections', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Connection created');
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error('Failed to save connection', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit connection' : 'New connection'}
          </DialogTitle>
          <DialogDescription>
            Store the details needed to launch this remote-access endpoint.
          </DialogDescription>
        </DialogHeader>
        <form
          id="connection-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={form.type}
              onValueChange={(value) =>
                setForm((f) => ({
                  ...f,
                  type: value as ClientType,
                  ...(value === 'RDP'
                    ? {}
                    : {
                        isVpnRequired: false,
                        port: '',
                        username: '',
                        domain: '',
                      }),
                }))
              }
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              placeholder="My work PC"
              required
            />
          </div>
          <div className={isRdp ? 'grid grid-cols-2 gap-4' : 'grid gap-2'}>
            <div className="grid gap-2">
              <Label htmlFor="host">Host / ID</Label>
              <Input
                id="host"
                value={form.host}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    host: e.target.value.replace(/\s/g, ''),
                  }))
                }
                required
              />
            </div>
            {isRdp && (
              <div className="grid gap-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={form.port}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, port: e.target.value }))
                  }
                />
              </div>
            )}
          </div>
          {isRdp && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={form.domain}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, domain: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <InputPassword
              id="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </div>
          {isRdp && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="isVpnRequired"
                checked={form.isVpnRequired}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, isVpnRequired: checked === true }))
                }
              />
              <Label htmlFor="isVpnRequired" className="font-normal">
                Requires VPN to connect
              </Label>
            </div>
          )}
          {isRdp && form.isVpnRequired && (
            <div className="flex flex-col gap-4 rounded-lg border border-foreground/10 p-3">
              <div className="grid gap-2">
                <Label htmlFor="vpnFile">VPN configuration file</Label>
                <input
                  ref={fileInputRef}
                  id="vpnFile"
                  type="file"
                  className="hidden"
                  onChange={onVpnFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="justify-start"
                >
                  <UploadSimpleIcon />
                  {form.vpnFileName || 'Upload VPN file'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vpnUsername">VPN username</Label>
                  <Input
                    id="vpnUsername"
                    value={form.vpnUsername}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, vpnUsername: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vpnPassword">VPN password</Label>
                  <InputPassword
                    id="vpnPassword"
                    value={form.vpnPassword}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, vpnPassword: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vpnEncryptionKey">Encryption key</Label>
                <InputPassword
                  id="vpnEncryptionKey"
                  value={form.vpnEncryptionKey}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      vpnEncryptionKey: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
        </form>
        <DialogFooter showCloseButton>
          <Button type="submit" form="connection-form" disabled={loading}>
            <FloppyDiskIcon />
            {isEdit ? 'Save changes' : 'Create connection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
