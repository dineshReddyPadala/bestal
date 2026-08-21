import { Select } from '@bestal/ui';
import { useAdminIcons } from '../../hooks/api/useAdmin';

type IconSelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
};

export function IconSelectField({
  value,
  onChange,
  disabled = false,
  label = 'Community icon',
}: IconSelectFieldProps) {
  const { data, isLoading, isError } = useAdminIcons({ limit: 100 });

  const icons = (data?.data ?? []) as Array<{
    id: number;
    name: string;
    url: string;
    isActive: boolean;
  }>;

  const activeIcons = icons.filter((icon) => icon.isActive);
  const selectedIcon = value
    ? activeIcons.find((icon) => String(icon.id) === value)
    : undefined;

  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || isLoading}
      >
        <option value="">Select icon</option>
        {activeIcons.map((icon) => (
          <option key={icon.id} value={String(icon.id)}>
            {icon.name}
          </option>
        ))}
      </Select>
      {selectedIcon?.url && selectedIcon.url !== 'pending' ? (
        <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
          <img
            src={selectedIcon.url}
            alt=""
            className="h-10 w-10 rounded-md object-cover ring-1 ring-border/60"
          />
          <span className="text-sm font-medium text-foreground">{selectedIcon.name}</span>
        </div>
      ) : null}
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading icons…</p>
      ) : isError ? (
        <p className="text-xs text-red-600">Unable to load icons.</p>
      ) : activeIcons.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No icons available. Create icons under Super Admin → Icons first.
        </p>
      ) : null}
    </label>
  );
}
