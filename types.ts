
export enum ExpenseCategory {
  Cab = 'Cab',
  BikeTaxi = 'Bike Taxi',
  Auto = 'Auto',
  FoodLunch = 'Food - Lunch',
  FoodDinner = 'Food - Dinner',
  Train = 'Train',
  Bus = 'Bus',
  Hotel = 'Hotel',
  Other = 'Other',
}

export enum PaymentMode {
  Cash = 'Cash',
  Online = 'Online Payment',
  UPI = 'UPI',
  Card = 'Card',
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  paymentMode: PaymentMode;
  datetime: string; // YYYY-MM-DDTHH:MM
  description?: string;
}

export interface Tour {
  id: string;
  userId: string;
  status: 'active' | 'completed';
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  advance: number;
  expenses: Expense[];
  totalExpenses?: number; // Added when tour is completed
  completionDate?: string; // YYYY-MM-DD, Added when tour is completed
}
