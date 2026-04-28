export const DEFAULT_CURRENCY_CODE = 'TZS';
const currencyFormatterCache = new Map<string, Intl.NumberFormat>();
const compactCurrencyFormatterCache = new Map<string, Intl.NumberFormat>();

function sanitizeCurrencyOutput(value: string) {
  return value.replace(/\u00A0/g, ' ');
}

function getCurrencyFormatter(currencyCode: string, compact = false) {
  const cache = compact ? compactCurrencyFormatterCache : currencyFormatterCache;

  if (!cache.has(currencyCode)) {
    cache.set(
      currencyCode,
      new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'code',
        maximumFractionDigits: 0,
        ...(compact ? { notation: 'compact' as const } : {}),
      })
    );
  }

  return cache.get(currencyCode)!;
}

export function formatCurrency(value: number, currencyCode = DEFAULT_CURRENCY_CODE) {
  return sanitizeCurrencyOutput(getCurrencyFormatter(currencyCode).format(value));
}

export function formatCompactCurrency(value: number, currencyCode = DEFAULT_CURRENCY_CODE) {
  return sanitizeCurrencyOutput(getCurrencyFormatter(currencyCode, true).format(value));
}
