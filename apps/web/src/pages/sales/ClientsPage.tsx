import { clients } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import { Avatar, Button, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MockClient } from '@bestal/mock-data';

export function ClientsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return [...clients];
    return clients.filter((c) => c.status === statusFilter);
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<MockClient>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Client',
        cell: ({ row }) => (
          <Link
            to={`/sales/clients/${row.original.id}`}
            className="flex items-center gap-3 hover:text-brand"
          >
            <Avatar name={row.original.name} src={row.original.logoUrl} size="sm" />
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.website}</p>
            </div>
          </Link>
        ),
      },
      { accessorKey: 'industry', header: 'Industry' },
      { accessorKey: 'accountManager', header: 'Account Manager' },
      {
        accessorKey: 'activeDeployments',
        header: 'Deployments',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as number}</span>,
      },
      {
        id: 'spend',
        header: 'Total Spend',
        accessorFn: (row) => row.totalSpend,
        cell: ({ row }) => formatCurrency(row.original.totalSpend, row.original.currency),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Client Accounts"
        description="Manage enterprise accounts, spend, and engagement history"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add client
          </Button>
        }
      />

      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search clients…"
          toolbar={
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PROSPECT">Prospect</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          }
        />
      </div>
    </div>
  );
}
