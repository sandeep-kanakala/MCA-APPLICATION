export interface FilterConfig {
  key: string;
  type: 'string' | 'date' | 'relation' | 'enum' | 'boolean';
  path?: string;
  operator?: 'equals' | 'contains' | 'gte' | 'lte' | 'in';
  mode?: 'insensitive';
}

export function buildPrismaWhereClause<T extends Record<string, unknown>>(
  filters: FilterConfig[],
  query: Record<string, unknown>,
): T {
  const where = {} as T;

  for (let i = 0; i < filters.length; i++) {
    const filter: FilterConfig = filters[i];
    const {
      key,
      type,
      path: filterPath,
      operator: filterOperator,
      mode,
    } = filter;

    const value = query[key];

    if (value === undefined || value === null || value === '') {
      continue;
    }

    const path = filterPath || key;
    const operator =
      filterOperator ||
      (type === 'string' && (value as string).includes(',') ? 'in' : 'equals');
    let conditionValue: unknown;

    switch (type) {
      case 'date':
        conditionValue = new Date(value as string);
        if (operator === 'lte') {
          (conditionValue as Date).setHours(23, 59, 59, 999);
        }
        break;
      case 'boolean':
        conditionValue = value === 'true' || value === true;
        break;
      default:
        conditionValue =
          operator === 'in' ? (value as string).split(',') : value;
    }

    const condition: Record<string, unknown> = {
      [operator]: conditionValue,
    };

    if (mode) {
      condition.mode = mode;
    }

    const pathParts = path.split('.');
    let current: Record<string, unknown> = where;
    for (let j = 0; j < pathParts.length - 1; j++) {
      const part = pathParts[j];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    const lastPart = pathParts[pathParts.length - 1];
    if (current[lastPart] && typeof current[lastPart] === 'object') {
      current[lastPart] = {
        ...(current[lastPart] as Record<string, unknown>),
        ...condition,
      };
    } else {
      current[lastPart] = condition;
    }
  }

  return where;
}
