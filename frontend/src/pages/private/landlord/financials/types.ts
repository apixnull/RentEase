export interface Property {
  id: string;
  title: string;
  type: string;
  address: {
    street: string;
    barangay: string;
    zipCode: string;
    city: string | null;
    municipality: string | null;
  };
  Unit: Array<{
    id: string;
    label: string;
  }>;
}

export type DateFilterType = 'SPECIFIC_MONTH' | 'SPECIFIC_YEAR' | 'ALL_TIME';
export type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';
export type DownloadType = 'PDF' | 'EXCEL';
export type ReportFilterType = 'ALL_PROPERTIES' | 'SPECIFIC_PROPERTY';

export const INCOME_CATEGORIES = ['RENT', 'LATE_FEE', 'DEPOSIT', 'OTHER_INCOME'] as const;
export const EXPENSE_CATEGORIES = [
  'MAINTENANCE',
  'REPAIRS',
  'UTILITIES',
  'INSURANCE',
  'TAXES',
  'PROPERTY_MANAGEMENT',
  'LISTING_ADVERTISING',
  'OTHER_EXPENSE',
] as const;

export const RECURRING_INTERVALS = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;
