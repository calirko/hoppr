import {
  DotsThreeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserDialog } from '@/components/user-dialog';
import { apiFetch } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  async function load() {
    setLoading(true);
    try {
      const items = await apiFetch<User[]>('/users');
      setUsers(items);
    } catch (error) {
      toast.error('Failed to load users', {
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

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await apiFetch(`/users/${deleting.id}`, { method: 'DELETE' });
      toast.success('User deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error('Failed to delete user', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">Users</h1>
          <p className="text-sm text-muted-foreground">
            Accounts that can sign in to Hoppr.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          New user
        </Button>
      </div>

      <div className="bg-background border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => {
              const isSelf = user.id === getCurrentUser()?.id;
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name ?? '-'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <DotsThreeIcon size={18} />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(user)}>
                          <PencilIcon />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={isSelf}
                          onClick={() => setDeleting(user)}
                        >
                          <TrashIcon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        onSaved={load}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete user"
        description={`This will permanently delete "${deleting?.name ?? deleting?.email}" and all of their connections.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
