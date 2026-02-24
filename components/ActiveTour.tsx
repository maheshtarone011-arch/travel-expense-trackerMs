
import React, { useState } from 'react';
import { Tour, Expense } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { Calendar, IndianRupee, PlusCircle, CheckCircle, Edit, Trash2, X, History, EyeOff, AlertTriangle } from 'lucide-react';
import ExpenseForm from './ExpenseForm';

interface ActiveTourProps {
    tour: Tour;
    totalExpenses: number;
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onUpdateExpense: (expense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
    onCompleteTour: (completionDate: string) => void;
    isHistoryVisible: boolean;
    onToggleHistory: () => void;
    hasHistory: boolean;
}

const StatCard: React.FC<{ title: string; amount: number; color: string; textColor: string; icon: React.ReactNode }> = ({ title, amount, color, textColor, icon }) => (
    <div className={`p-4 rounded-xl shadow-lg flex items-center gap-4 border border-opacity-20 ${color} border-black`}>
        <div className="p-2.5 bg-white bg-opacity-30 rounded-full shadow-sm text-white">{icon}</div>
        <div>
            <p className={`text-sm font-semibold uppercase tracking-wider ${textColor}`}>{title}</p>
            <p className="text-lg font-bold text-white mt-0.5 drop-shadow-sm">
                {amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </p>
        </div>
    </div>
);

const ConfirmDeleteModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-[60] backdrop-blur-sm animate-fade-in-up">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border-2 border-red-100">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-red-100 rounded-full text-red-600">
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Expense?</h3>
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

const CompleteTourModal: React.FC<{
    tour: Tour;
    totalExpenses: number;
    onConfirm: (completionDate: string) => void;
    onClose: () => void;
}> = ({ tour, totalExpenses, onConfirm, onClose }) => {
    const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
    const balance = tour.advance - totalExpenses;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative animate-fade-in-up border border-gray-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <X size={26} />
                </button>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Confirm Tour Completion</h3>

                {/* Confirmation Message */}
                <div className="mb-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-900 text-sm font-medium flex gap-3 items-start">
                    <AlertTriangle className="shrink-0 text-yellow-600 mt-0.5" size={20} />
                    <p>
                        Are you sure you want to complete <strong className="text-indigo-700">{tour.name}</strong>?
                        <br />
                        <span className="text-yellow-700 text-xs mt-1 block opacity-90">This will close active tracking and move this trip to your history archive.</span>
                    </p>
                </div>

                <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-base">
                        <span className="font-bold text-gray-700">Start Date:</span>
                        <span className="text-gray-900">{new Date(tour.startDate).toLocaleDateString()}</span>
                        <span className="font-bold text-gray-700">Planned End:</span>
                        <span className="text-gray-900">{new Date(tour.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-4 mt-2">
                        <label htmlFor="completionDate" className="block text-sm font-bold text-gray-800 mb-2">Actual Completion Date</label>
                        <input
                            id="completionDate"
                            type="date"
                            value={completionDate}
                            onChange={(e) => setCompletionDate(e.target.value)}
                            min={tour.startDate}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
                        />
                    </div>
                </div>

                <div className="mt-6 space-y-3 text-lg">
                    <div className="flex justify-between items-center"><span className="text-gray-600 font-medium">Company Advance:</span> <span className="font-bold text-gray-900">{tour.advance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600 font-medium">Total Expenses:</span> <span className="font-bold text-orange-600">{totalExpenses.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></div>
                    <div className={`flex justify-between items-center font-extrabold text-xl border-t-2 pt-3 mt-2 ${balance < 0 ? 'text-red-600 border-red-100' : 'text-green-600 border-green-100'}`}>
                        <span>{balance < 0 ? 'Overspent:' : 'Balance:'}</span>
                        <span>{balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-8">
                    <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition">Cancel</button>
                    <button type="button" onClick={() => onConfirm(completionDate)} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md transition transform active:scale-95">Confirm & Complete</button>
                </div>
            </div>
        </div>
    );
}

const ActiveTour: React.FC<ActiveTourProps> = ({ tour, totalExpenses, onAddExpense, onUpdateExpense, onDeleteExpense, onCompleteTour, isHistoryVisible, onToggleHistory, hasHistory }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const balance = tour.advance - totalExpenses;
    const isOverspent = balance < 0;

    const handleEditClick = (expense: Expense) => {
        setExpenseToEdit(expense);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (expenseId: string) => {
        setDeleteId(expenseId);
    };

    const confirmDelete = () => {
        if (deleteId) {
            onDeleteExpense(deleteId);
            setDeleteId(null);
        }
    };

    const handleAddClick = () => {
        setExpenseToEdit(null);
        setIsFormOpen(true);
    }

    const handleConfirmComplete = (completionDate: string) => {
        if (new Date(completionDate) < new Date(tour.startDate)) {
            alert("Completion date cannot be before the tour start date.");
            return;
        }
        onCompleteTour(completionDate);
        setIsCompleteModalOpen(false);
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-indigo-600 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{tour.name}</h2>
                    <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-medium mt-1.5 bg-indigo-50 px-2.5 py-1 rounded-full w-fit">
                        <Calendar size={14} />
                        <span>{new Date(tour.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(tour.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Active Tour
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <StatCard title="Company Advance" amount={tour.advance} color="bg-gradient-to-br from-blue-500 to-blue-600" textColor="text-blue-100" icon={<IndianRupee size={28} />} />
                <StatCard title="Total Spent" amount={totalExpenses} color="bg-gradient-to-br from-orange-500 to-orange-600" textColor="text-orange-100" icon={<IndianRupee size={28} />} />
                <div className={`p-5 rounded-xl shadow-lg flex items-center gap-5 border border-opacity-20 ${isOverspent ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'} border-black`}>
                    <div className="p-2.5 bg-white bg-opacity-30 rounded-full shadow-sm text-white"><IndianRupee size={22} /></div>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-white opacity-90">Balance</p>
                        <p className="text-lg font-bold text-white mt-0.5 drop-shadow-sm">
                            {balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                        </p>
                        {isOverspent && <p className="text-xs font-bold text-white bg-red-800 bg-opacity-30 px-2 py-0.5 rounded mt-1 inline-block">Overspent</p>}
                    </div>
                </div>
            </div>

            {/* Expenses Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Expense Log</h3>
                    <button onClick={handleAddClick} className="bg-indigo-600 text-white text-sm font-semibold py-2 px-4 rounded-xl hover:bg-indigo-700 flex items-center gap-1.5 transition-all transform hover:scale-105 shadow-md">
                        <PlusCircle size={16} />
                        Add New
                    </button>
                </div>

                <div className="divide-y divide-gray-100">
                    {tour.expenses.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
                                <IndianRupee size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No expenses recorded yet.</p>
                            <p className="text-gray-400 text-sm mt-1">Click "Add New" to start tracking.</p>
                        </div>
                    ) : (
                        tour.expenses.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()).map(exp => (
                            <div key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50 transition-colors duration-200 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-1">
                                        {React.cloneElement(CATEGORY_ICONS[exp.category], { size: 22 })}
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">{exp.category}</p>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-sm text-gray-500">
                                            <span>{new Date(exp.datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                            <span>{new Date(exp.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-sm uppercase tracking-wide">{exp.paymentMode}</span>
                                        </div>
                                        {exp.description && <p className="text-sm text-gray-500 mt-1.5 italic border-l-2 border-gray-300 pl-2">{exp.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                                    {/* UPDATED AMOUNT DISPLAY */}
                                    <span className="text-sm font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg shadow-sm font-mono tracking-wide">
                                        {exp.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditClick(exp); }}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(exp.id); }}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                {hasHistory && (
                    <button onClick={onToggleHistory} className={`w-full text-sm font-semibold py-3 px-5 rounded-xl border flex items-center justify-center gap-2 transition-transform transform active:scale-95 shadow-sm ${isHistoryVisible ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                        {isHistoryVisible ? <EyeOff size={18} /> : <History size={18} />}
                        {isHistoryVisible ? 'Hide Completed Tours' : 'View Past Tours'}
                    </button>
                )}
                <button onClick={() => setIsCompleteModalOpen(true)} className="w-full bg-green-600 text-white text-sm font-semibold py-3 px-5 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 transition-transform transform active:scale-95 shadow-lg shadow-green-200">
                    <CheckCircle size={18} />
                    Complete & Close Tour
                </button>
            </div>

            {isFormOpen && <ExpenseForm onSubmit={onAddExpense} onUpdate={onUpdateExpense} onClose={() => setIsFormOpen(false)} expenseToEdit={expenseToEdit} />}
            {isCompleteModalOpen && <CompleteTourModal tour={tour} totalExpenses={totalExpenses} onClose={() => setIsCompleteModalOpen(false)} onConfirm={handleConfirmComplete} />}
            {deleteId && <ConfirmDeleteModal onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />}
        </div>
    );
};

export default ActiveTour;
