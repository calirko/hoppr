import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
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
import type { Connection } from '@/lib/types';

interface VpnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: Connection | null;
}

export function VpnDialog({ open, onOpenChange, connection }: VpnDialogProps) {
  const vpn = connection?.vpn ?? null;

  function download() {
    if (!vpn) return;
    const blob = new Blob([vpn.fileContent], {
      type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = vpn.fileName || 'vpn-config';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>VPN details</DialogTitle>
          <DialogDescription>
            {connection?.label} requires a VPN connection.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="vpn-view-username">Username</Label>
            <Input
              id="vpn-view-username"
              value={vpn?.username ?? ''}
              readOnly
              placeholder="Not set"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vpn-view-password">Password</Label>
            <InputPassword
              id="vpn-view-password"
              value={vpn?.password ?? ''}
              readOnly
              placeholder="Not set"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vpn-view-key">Encryption key</Label>
            <InputPassword
              id="vpn-view-key"
              value={vpn?.encryptionKey ?? ''}
              readOnly
              placeholder="Not set"
            />
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button type="button" onClick={download} disabled={!vpn}>
            <DownloadSimpleIcon />
            Download VPN file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
