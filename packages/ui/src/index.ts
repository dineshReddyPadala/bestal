// Components
export { Button, type ButtonProps } from './components/button.js';
export { BesTalBrand, BesTalWordmark, type BesTalBrandProps } from './components/bestal-brand.js';
export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from './components/card.js';
export { Badge, type BadgeProps } from './components/badge.js';
export { Input, type InputProps } from './components/input.js';
export { PasswordInput, type PasswordInputProps } from './components/password-input.js';
export { Avatar, type AvatarProps } from './components/avatar.js';
export { StatCard, type StatCardProps } from './components/stat-card.js';
export { PageHeader, type PageHeaderProps } from './components/page-header.js';
export { StatusBadge, type StatusBadgeProps, type StatusKey } from './components/status-badge.js';
export { SkillBadge, type SkillBadgeProps } from './components/skill-badge.js';
export { TalentCard, type TalentCardProps } from './components/talent-card.js';
export { SearchInput, type SearchInputProps } from './components/search-input.js';
export { EmptyState, type EmptyStateProps } from './components/empty-state.js';
export {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
  type DataTableProps,
} from './components/data-table.js';
export { TanStackDataTable, type TanStackDataTableProps } from './components/tanstack-data-table.js';
export { Select, type SelectProps } from './components/select.js';
export { Tabs, type TabsProps } from './components/tabs.js';
export { ChartCard, type ChartCardProps } from './components/chart-card.js';
export {
  RevenueAreaChart,
  DeploymentBarChart,
  PipelineBarChart,
  StatusPieChart,
  type ChartSeries,
} from './components/charts.js';

// Layouts
export {
  MarketingLayout,
  type MarketingLayoutProps,
  type MarketingNavItem,
} from './layouts/marketing-layout.js';
export {
  DashboardLayout,
  useDashboardHeaderLeading,
  type DashboardLayoutProps,
  type DashboardNavItem,
  type DashboardUser,
} from './layouts/dashboard-layout.js';
export { AuthLayout, type AuthLayoutProps } from './layouts/auth-layout.js';

// Utilities
export { Dialog, type DialogProps } from './components/dialog.js';
export { FileUpload, type FileUploadProps } from './components/file-upload.js';
export { FormField, type FormFieldProps } from './components/form-field.js';
export { DocumentList, type DocumentListProps, type DocumentItem } from './components/document-list.js';
export { PricingEditor, type PricingEditorProps } from './components/pricing-editor.js';
export { resolveIcon } from './lib/icons.js';
