import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Activity, Users, FileText, Settings, LayoutDashboard, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: 'Dashboard', icon: LayoutDashboard },
    { name: 'Patients', path: 'Patients', icon: Users },
    { name: 'New Screening', path: 'NewScreening', icon: PlusCircle },
    { name: 'Reports', path: 'Reports', icon: FileText },
    { name: 'Settings', path: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans landscape:flex-row portrait:flex-col overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-teal-500 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Viona</h1>
            <p className="text-xs text-slate-400">Clinical Screening Demo</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === createPageUrl(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                  isActive 
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto">
          <Alert className="bg-slate-800 border-slate-700 text-slate-300">
            <AlertTitle className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">Disclaimer</AlertTitle>
            <AlertDescription className="text-xs">
              Prototype/demo — not clinically validated. For demonstration purposes only.
            </AlertDescription>
          </Alert>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}