
import React, { useState } from 'react';
import { Tour } from '../types';
import { Calendar, IndianRupee, NotebookText, PlusCircle, ArrowRight } from 'lucide-react';

interface TourSetupProps {
  onStartTour: (tourData: Omit<Tour, 'id' | 'expenses' | 'userId' | 'status'>) => void;
}

const TourSetup: React.FC<TourSetupProps> = ({ onStartTour }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [advance, setAdvance] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !advance) {
      setError('Please fill all fields.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }
    if (parseFloat(advance) < 0) {
      setError('Advance amount cannot be negative.');
      return;
    }
    setError('');
    onStartTour({
      name,
      startDate,
      endDate,
      advance: parseFloat(advance),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-indigo-50 max-w-2xl mx-auto overflow-hidden animate-fade-in-up">
      <div className="bg-indigo-700 p-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">Plan New Trip</h2>
        <p className="text-indigo-200 text-sm mt-1">Enter details to start tracking expenses</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Tour Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tour / Trip Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <NotebookText className="h-5 w-5 text-indigo-500" />
            </div>
            <input
              type="text"
              placeholder="e.g., Goa Vacation, Client Visit Mumbai"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Advance Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Advance / Budget</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>
            <input
              type="number"
              placeholder="0"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold text-lg text-gray-900"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-indigo-200 mt-2"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Start Tour</span>
          <ArrowRight className="h-4 w-4 opacity-70" />
        </button>
      </form>
    </div>
  );
};

export default TourSetup;