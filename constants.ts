
import { ExpenseCategory, PaymentMode } from './types';
import { Car, Utensils, TrainFront, BusFront, Building, FilePlus, Bike, CarFront, type LucideProps } from 'lucide-react';
import React from 'react';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.Cab,
  ExpenseCategory.BikeTaxi,
  ExpenseCategory.Auto,
  ExpenseCategory.FoodLunch,
  ExpenseCategory.FoodDinner,
  ExpenseCategory.Train,
  ExpenseCategory.Bus,
  ExpenseCategory.Hotel,
  ExpenseCategory.Other,
];

export const PAYMENT_MODES: PaymentMode[] = [
  PaymentMode.Cash,
  PaymentMode.Online,
  PaymentMode.UPI,
  PaymentMode.Card,
];

// FIX: Replaced JSX syntax with `React.createElement` to avoid parsing errors in a .ts file.
// FIX: Add `LucideProps` to the element type. This allows `React.cloneElement` in other components
// to correctly infer props like `size` and avoid type errors.
export const CATEGORY_ICONS: { [key in ExpenseCategory]: React.ReactElement<LucideProps> } = {
    [ExpenseCategory.Cab]: React.createElement(Car, { size: 24, className: "text-yellow-600" }),
    [ExpenseCategory.BikeTaxi]: React.createElement(Bike, { size: 24, className: "text-blue-500" }),
    [ExpenseCategory.Auto]: React.createElement(CarFront, { size: 24, className: "text-green-600" }),
    [ExpenseCategory.FoodLunch]: React.createElement(Utensils, { size: 24, className: "text-orange-500" }),
    [ExpenseCategory.FoodDinner]: React.createElement(Utensils, { size: 24, className: "text-red-500" }),
    [ExpenseCategory.Train]: React.createElement(TrainFront, { size: 24, className: "text-blue-500" }),
    [ExpenseCategory.Bus]: React.createElement(BusFront, { size: 24, className: "text-indigo-500" }),
    [ExpenseCategory.Hotel]: React.createElement(Building, { size: 24, className: "text-purple-500" }),
    [ExpenseCategory.Other]: React.createElement(FilePlus, { size: 24, className: "text-gray-500" }),
};