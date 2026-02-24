
import React, { useState } from 'react';
import { Tour, Expense } from '../types';
import { History, ChevronDown, ChevronUp, Calendar, Lock, Unlock, PlusCircle, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import ExpenseForm from './ExpenseForm';

interface PastToursProps {
    tours: Tour[];
    onUpdateTour: (tour: Tour) => void;
    onDeleteTour: (tourId: string) => void;
}

const ConfirmDeleteModal: React.FC<{ title: string; onConfirm: () => void; onCancel: () => void }> = ({ title, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-[60] backdrop-blur-sm animate-fade-in-up">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border-2 border-red-100">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-red-100 rounded-full text-red-600">
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                    <p className="text-gray-500 mt-1.5 text-sm">This action cannot be undone.</p>
                </div>
                <div className="flex gap-3 w-full pt-2">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition">Delete</button>
                </div>
            </div>
        </div>
    </div>
);

const PastTourItem: React.FC<{ tour: Tour, onUpdateTour: (t: Tour) => void, onDeleteTour: (id: string) => void }> = ({ tour, onUpdateTour, onDeleteTour }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'expense' | 'tour', id: string } | null>(null);

    const totalExpenses = tour.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const balance = tour.advance - totalExpenses;
    const isOverspent = balance < 0;

    const handleUnlock = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggling the accordion
        setIsUnlocked(true);
    };

    const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expenseData, id: Date.now().toString() };
        const updatedTour = {
            ...tour,
            expenses: [...tour.expenses, newExpense]
        };
        onUpdateTour(updatedTour);
    };

    const handleUpdateExpense = (updatedExpense: Expense) => {
        const updatedTour = {
            ...tour,
            expenses: tour.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
        };
        onUpdateTour(updatedTour);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'expense') {
            const updatedTour = {
                ...tour,
                expenses: tour.expenses.filter(e => e.id !== itemToDelete.id)
            };
            onUpdateTour(updatedTour);
        } else if (itemToDelete.type === 'tour') {
            onDeleteTour(itemToDelete.id);
        }
        setItemToDelete(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Card Header (Always Visible) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col md:flex-row md:items-center justify-between p-5 cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
            >
                <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900">{tour.name}</h4>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1.5">
                        <Calendar size={13} className="text-indigo-600" />
                        <span>{new Date(tour.startDate).toLocaleDateString('en-GB')} — {tour.completionDate ? new Date(tour.completionDate).toLocaleDateString('en-GB') : 'Ongoing'}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Balance</p>
                        <p className={`font-bold text-lg ${isOverspent ? 'text-red-600' : 'text-green-600'}`}>
                            {balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </p>
                    </div>
                    {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>
            </div>

            {/* Expanded Content */}
            {isOpen && (
                <div className="border-t border-gray-200 bg-white">
                    {/* Controls Bar */}
                    <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-500">Details & Editing</span>
                        {!isUnlocked ? (
                            <button
                                onClick={handleUnlock}
                                className="flex items-center gap-2 px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full text-xs font-bold transition shadow-sm"
                            >
                                <Lock size={14} /> Unlock to Edit
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setExpenseToEdit(null); setIsFormOpen(true); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition shadow-sm"
                                >
                                    <PlusCircle size={14} /> Add New
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsUnlocked(false); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-full text-xs font-bold transition border border-green-200"
                                >
                                    <Unlock size={14} /> Finish
                                </button>
                                <button
                                    onClick={() => setItemToDelete({ type: 'tour', id: tour.id })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-xs font-bold transition border border-red-200 ml-2"
                                    title="Delete this entire tour"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-5">
                        {/* Summary Blocks */}
                        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm font-bold text-blue-700 uppercase">Advance</p>
                                <p className="font-extrabold text-blue-900 text-lg">{tour.advance.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <p className="text-sm font-bold text-orange-700 uppercase">Expenses</p>
                                <p className="font-extrabold text-orange-900 text-lg">{totalExpenses.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className={`p-3 rounded-lg border ${isOverspent ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                <p className={`text-sm font-bold uppercase ${isOverspent ? 'text-red-700' : 'text-green-700'}`}>Balance</p>
                                <p className={`font-extrabold text-lg ${isOverspent ? 'text-red-900' : 'text-green-900'}`}>{balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>

                        <h5 className="font-semibold text-gray-800 mb-2 text-sm border-b pb-2">Expense History</h5>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                            {tour.expenses.length > 0 ? tour.expenses.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()).map(exp => (
                                <div key={exp.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900 text-base">{exp.category}</p>
                                            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{exp.paymentMode}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 mt-1">
                                            {new Date(exp.datetime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {exp.description && <p className="text-sm text-gray-500 italic mt-1">{exp.description}</p>}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="font-bold text-white text-sm bg-indigo-600 px-3 py-1.5 rounded-lg shadow-sm">
                                            {exp.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </span>

                                        {isUnlocked && (
                                            <div className="flex gap-2">
                                                <button onClick={() => { setExpenseToEdit(exp); setIsFormOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors" title="Edit"><Edit size={16} /></button>
                                                <button onClick={() => setItemToDelete({ type: 'expense', id: exp.id })} className="text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-4 font-medium italic bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    No expenses recorded for this tour.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Modals */}
                    {isFormOpen && (
                        <ExpenseForm
                            onClose={() => setIsFormOpen(false)}
                            onSubmit={handleAddExpense}
                            onUpdate={handleUpdateExpense}
                            expenseToEdit={expenseToEdit}
                        />
                    )}
                    {itemToDelete && (
                        <ConfirmDeleteModal
                            title={itemToDelete.type === 'tour' ? 'Delete Entire Tour?' : 'Delete Expense?'}
                            onConfirm={confirmDelete}
                            onCancel={() => setItemToDelete(null)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};


const PastTours: React.FC<PastToursProps> = ({ tours, onUpdateTour, onDeleteTour }) => {
    const [isListOpen, setIsListOpen] = useState(true);

    if (tours.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 pb-16">
            <button
                onClick={() => setIsListOpen(!isListOpen)}
                className="w-full flex justify-between items-center p-5 bg-gradient-to-r from-indigo-800 to-indigo-900 rounded-xl shadow-lg hover:shadow-xl transition-all mb-6"
            >
                <div className="flex items-center gap-3 text-white">
                    <History className="h-5 w-5 opacity-80" />
                    <h3 className="text-lg font-bold tracking-wide">Tour History ({tours.length})</h3>
                </div>
                {isListOpen ? <ChevronUp className="text-indigo-200 h-6 w-6" /> : <ChevronDown className="text-indigo-200 h-6 w-6" />}
            </button>

            {isListOpen && (
                <div className="space-y-5 animate-fade-in-up">
                    {tours.map(tour => (
                        <PastTourItem key={tour.id} tour={tour} onUpdateTour={onUpdateTour} onDeleteTour={onDeleteTour} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PastTours;
