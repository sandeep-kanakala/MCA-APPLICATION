import { FilterConfig } from '@/utils/filter.builder';

export const exportFilterConfig: FilterConfig[] = [
  {
    key: 'from',
    type: 'date',
    operator: 'gte',
    path: 'createdAt',
  },
  {
    key: 'to',
    type: 'date',
    operator: 'lte',
    path: 'createdAt',
  },
  {
    key: 'isArchived',
    type: 'boolean',
    operator: 'equals',
  },
];
