export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

export interface LaravelPagination<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export function isLaravelPagination<T>(value: unknown): value is LaravelPagination<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as LaravelPagination<T>).data) &&
    typeof (value as LaravelPagination<T>).total === 'number'
  );
}

export function normalizePagination<T>(
  response: unknown,
  mapItem: (item: Record<string, unknown>) => T,
): { data: T[]; total: number; pagination: LaravelPagination<T> | null } {
  if (Array.isArray(response)) {
    return {
      data: response.map((item) => mapItem(item as Record<string, unknown>)),
      total: response.length,
      pagination: null,
    };
  }

  if (isLaravelPagination<Record<string, unknown>>(response)) {
    return {
      data: response.data.map(mapItem),
      total: response.total,
      pagination: {
        ...response,
        data: response.data.map(mapItem),
      },
    };
  }

  const envelope = response as { data?: unknown[]; total?: number };
  if (Array.isArray(envelope?.data)) {
    return {
      data: envelope.data.map((item) => mapItem(item as Record<string, unknown>)),
      total: toNumber(envelope.total, envelope.data.length),
      pagination: null,
    };
  }

  return { data: [], total: 0, pagination: null };
}
