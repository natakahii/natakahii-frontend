// Cargo shipping price calculator
// Pricing structure (TZS):
// Base Rate: 12,000
// Per KG Rate: 1,500
// Service Level Multipliers:
//   - standard: 1.0x (2-4 days)
//   - express: 1.5x (1-2 days)
//   - same_day: 2.0x (today)

export function calculateCargoQuote(weightKg: number, serviceLevel: 'standard' | 'express' | 'same_day'): number {
  const baseRate = 12000;
  const perKgRate = 1500;
  
  let price = baseRate + (weightKg * perKgRate);
  
  switch (serviceLevel) {
    case 'express':
      price = price * 1.5;
      break;
    case 'same_day':
      price = price * 2;
      break;
    case 'standard':
    default:
      price = price;
      break;
  }
  
  return Math.round(price / 100) * 100; // Round to nearest 100
}

export function getServiceDays(serviceLevel: 'standard' | 'express' | 'same_day'): string {
  switch (serviceLevel) {
    case 'same_day':
      return 'Today';
    case 'express':
      return '1-2 Business Days';
    case 'standard':
    default:
      return '2-4 Business Days';
  }
}
