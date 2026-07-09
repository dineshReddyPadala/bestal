import { Button, Dialog, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Upload, UserPlus } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { UserInviteForm } from '../../components/forms/UserInviteForm';
import type { UserInviteFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';
import { useUserMutations, useUsersList } from '../../hooks/api/useUsers';
import type { UserListItem } from '../../lib/api/users';
import {
  parseUserInviteCsv,
  USER_CSV_TEMPLATE,
  type ParsedUserCsvRow,
} from '../../lib/user-csv-import';
import { ListingPageShell } from '../../components/layout/ListingPageShell';

export function UsersPage() {
  const { message, show } = useDemoToast();
  const { data, isLoading, isError, error } = useUsersList({ limit: 100, sort: '-createdAt' });
  const { invite, inviteBulk } = useUserMutations();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkPreview, setBulkPreview] = useState<{
    valid: ParsedUserCsvRow[];
    invalid: ParsedUserCsvRow[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: 'firstName',
        header: 'Name',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ getValue }) => (getValue() as string | null) || '—',
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => {
          const role = getValue() as string | null;
          return role ? <StatusBadge status={role} /> : '—';
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ getValue }) => (
          <StatusBadge status={(getValue() as boolean) ? 'ACTIVE' : 'INACTIVE'} />
        ),
      },
      {
        accessorKey: 'lastLoginAt',
        header: 'Last Login',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? new Date(v).toLocaleString() : 'Never';
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
    ],
    [],
  );

  async function handleInvite(values: UserInviteFormValues) {
    try {
      const result = await invite.mutateAsync({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
        role: values.role,
      });
      show(
        result.emailSent
          ? `Invite emailed to ${values.email}`
          : `User created for ${values.email} (email not sent — check mail config)`,
      );
      setInviteOpen(false);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Invite failed');
    }
  }

  function handleCsvSelected(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const parsed = parseUserInviteCsv(text);
      setBulkPreview({ valid: parsed.valid, invalid: parsed.invalid });
    };
    reader.readAsText(file);
  }

  async function handleBulkSubmit() {
    if (!bulkPreview?.valid.length) return;
    try {
      const result = await inviteBulk.mutateAsync(
        bulkPreview.valid.map((r) => ({
          email: r.email,
          firstName: r.firstName,
          lastName: r.lastName,
          phone: r.phone,
          role: r.role,
        })),
      );
      show(`Bulk invite: ${result.created} created, ${result.failed} failed`);
      setBulkOpen(false);
      setBulkPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bulk invite failed');
    }
  }

  function downloadTemplate() {
    const blob = new Blob([USER_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-invite-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <ListingPageShell
        title="Users"
        message={message}
        loading={isLoading}
        loadingLabel="Loading users…"
        error={isError ? (error instanceof Error ? error.message : 'Failed to load users') : null}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Bulk upload
            </Button>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Invite user
            </Button>
          </>
        }
      >
        <TanStackDataTable
          columns={columns}
          data={data?.data ?? []}
          searchPlaceholder="Search users…"
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          filtersInline
        />
      </ListingPageShell>

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite user"
        description="Create a Sales or Recruiter account and email login credentials."
        className="max-w-lg"
      >
        <UserInviteForm
          onSubmit={handleInvite}
          onCancel={() => setInviteOpen(false)}
          submitting={invite.isPending}
        />
      </Dialog>

      <Dialog
        open={bulkOpen}
        onClose={() => {
          setBulkOpen(false);
          setBulkPreview(null);
        }}
        title="Bulk invite users"
        description="Upload a CSV with firstName, lastName, email, phone, role (RECRUITER | SALES | ADMIN)."
        scrollable
        className="max-w-xl"
        footer={
          <>
            <Button variant="outline" onClick={downloadTemplate}>
              Download template
            </Button>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleBulkSubmit()}
              disabled={!bulkPreview?.valid.length || inviteBulk.isPending}
            >
              {inviteBulk.isPending
                ? 'Inviting…'
                : `Invite ${bulkPreview?.valid.length ?? 0} users`}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCsvSelected(file);
            }}
          />

          {bulkPreview && (
            <div className="space-y-2 text-sm">
              <p className="text-emerald-700">
                {bulkPreview.valid.length} valid row(s) ready to invite
              </p>
              {bulkPreview.invalid.length > 0 && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                  <p className="font-medium">{bulkPreview.invalid.length} invalid row(s)</p>
                  <ul className="mt-2 list-disc pl-5">
                    {bulkPreview.invalid.slice(0, 5).map((r) => (
                      <li key={r.rowNumber}>
                        Row {r.rowNumber}: {r.errors.join('; ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
