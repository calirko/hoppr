import { FloppyDiskIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { apiFetch } from '@/lib/api';
import type { User } from '@/lib/types';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSaved: () => void;
}

const EMPTY_FORM = { name: '', email: '', password: '' };

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: UserDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(user);

  useEffect(() => {
    if (!open) return;
    setForm(
      user
        ? { name: user.name ?? '', email: user.email, password: '' }
        : EMPTY_FORM,
    );
  }, [open, user]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.email || (!isEdit && !form.password)) {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name || null,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
      };

      if (isEdit && user) {
        await apiFetch(`/users/${user.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('User updated');
      } else {
        await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('User created');
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error('Failed to save user', {
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
          <DialogTitle>{isEdit ? 'Edit user' : 'New user'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this user’s details. Leave password blank to keep it unchanged.'
              : 'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="user-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">
              {isEdit ? 'New password (optional)' : 'Password'}
            </Label>
            <InputPassword
              id="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required={!isEdit}
            />
          </div>
        </form>
        <DialogFooter showCloseButton>
          <Button type="submit" form="user-form" disabled={loading}>
            <FloppyDiskIcon />
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
