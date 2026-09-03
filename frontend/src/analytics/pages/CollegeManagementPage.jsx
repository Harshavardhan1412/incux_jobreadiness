import { useApp } from '../../context/AppContext';
import CollegeManagement from '../components/sections/CollegeManagement';
import { ArrowLeft } from 'lucide-react';

export default function CollegeManagementPage() {
  const { navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('analytics')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Analytics
              </button>
              <span className="text-sm text-slate-400">/</span>
              <span className="text-sm font-medium text-slate-700">College Management</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollegeManagement />
      </main>
    </div>
  );
}