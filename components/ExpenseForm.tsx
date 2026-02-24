
import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, PaymentMode } from '../types';
import { EXPENSE_CATEGORIES, PAYMENT_MODES } from '../constants';
import { X, IndianRupee, Save } from 'lucide-react';

interface ExpenseFormProps {
    onSubmit: (expense: Omit<Expense, 'id'>) => void;
    onUpdate: (expense: Expense) => void;
    onClose: () => void;
    expenseToEdit: Expense | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onUpdate, onClose, expenseToEdit }) => {
    const [category, setCategory] = useState<ExpenseCategory>(expenseToEdit?.category || ExpenseCategory.FoodLunch);
    const [amount, setAmount] = useState(expenseToEdit?.amount.toString() || '');
    const [paymentMode, setPaymentMode] = useState<PaymentMode>(expenseToEdit?.paymentMode || PaymentMode.UPI);
    const [date, setDate] = useState(expenseToEdit?.datetime?.split('T')[0] || new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(expenseToEdit?.datetime ? new Date(expenseToEdit.datetime).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5));
    const [description, setDescription] = useState(expenseToEdit?.description || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (expenseToEdit) {
            setCategory(expenseToEdit.category);
            setAmount(expenseToEdit.amount.toString());
            setPaymentMode(expenseToEdit.paymentMode);
            setDate(expenseToEdit.datetime.split('T')[0]);
            setTime(new Date(expenseToEdit.datetime).toTimeString().slice(0, 5));
            setDescription(expenseToEdit.description || '');
        }
    }, [expenseToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        setError('');
        const expenseData = {
            category,
            amount: parseFloat(amount),
            paymentMode,
            datetime: `${date}T${time}`,
            description,
        };
        if (expenseToEdit) {
            onUpdate({ ...expenseData, id: expenseToEdit.id });
        } else {
            onSubmit(expenseData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in-up overflow-hidden">

                {/* Header */}
                <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                    <h3 className="text-base font-bold tracking-wide">{expenseToEdit ? 'Edit Expense' : 'Add New Expense'}</h3>
                    <button onClick={onClose} className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Amount Field - Centerpiece */}
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 text-center">Amount Spent</label>
                        <div className="relative flex items-center justify-center">
                            <IndianRupee className="absolute left-4 text-indigo-600 h-6 w-6" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white p-2.5 pl-12 text-center text-2xl font-bold text-indigo-900 rounded-lg border-2 border-indigo-200 focus:border-indigo-600 focus:outline-none placeholder-indigo-200"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Category & Mode */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-gray-800"
                            >
                                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>

                    {/* Payment Mode */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Payment Mode</label>
                        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-lg">
                            {PAYMENT_MODES.slice(0, 2).map(mode => (
                                <button
                                    type="button"
                                    key={mode}
                                    onClick={() => setPaymentMode(mode)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${paymentMode === mode ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                            <select
                                value={PAYMENT_MODES.includes(paymentMode) && !PAYMENT_MODES.slice(0, 2).includes(paymentMode) ? paymentMode : ''}
                                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                                className={`flex-1 bg-transparent text-xs font-bold text-center outline-none ${!PAYMENT_MODES.slice(0, 2).includes(paymentMode) ? 'text-indigo-700' : 'text-gray-500'}`}
                            >
                                <option value="" disabled>More...</option>
                                {PAYMENT_MODES.slice(2).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            rows={2}
                            placeholder="Details about the expense..."
                        ></textarea>
                    </div>

                    {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                        <button type="submit" className="flex-[2] px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 transition-transform active:scale-95">
                            <Save size={18} />
                            {expenseToEdit ? 'Update Expense' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
