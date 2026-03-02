import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Reports() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedId = urlParams.get('id');

  const { data: screenings = [], isLoading } = useQuery({
    queryKey: ['screenings-with-patients'],
    queryFn: async () => {
      const screens = await base44.entities.Screening.list('-date', 100);
      const patients = await base44.entities.Patient.list();
      const patientMap = patients.reduce((acc, p) => ({...acc, [p.id]: p}), {});
      
      return screens.map(s => ({
        ...s,
        patient: patientMap[s.patient_id] || { first_name: 'Unknown', last_name: 'Patient' }
      }));
    }
  });

  const selectedReport = selectedId ? screenings.find(s => s.id === selectedId) : null;

  return (
    <div className="h-full flex gap-6">
      
      {/* List Sidebar */}
      <div className="w-1/3 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-lg text-slate-900">Screening Reports</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {screenings.map(s => (
            <Link 
              key={s.id} 
              to={createPageUrl(`Reports?id=${s.id}`)}
              className={`block p-4 hover:bg-slate-50 transition-colors ${selectedId === s.id ? 'bg-teal-50/50 border-l-4 border-teal-500' : 'border-l-4 border-transparent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-slate-900">{s.patient.first_name} {s.patient.last_name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  s.risk_score === 'High' ? 'bg-rose-100 text-rose-700' :
                  s.risk_score === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {s.risk_score}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {format(new Date(s.date), 'MMM dd, yyyy HH:mm')}
              </p>
            </Link>
          ))}
          {screenings.length === 0 && !isLoading && (
             <div className="p-8 text-center text-slate-500 text-sm">No reports available.</div>
          )}
        </div>
      </div>

      {/* Report Detail View */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-y-auto p-8">
        {selectedReport ? (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Clinical Report</h1>
                <p className="text-slate-500">ID: {selectedReport.id}</p>
                <p className="text-slate-500">Date: {format(new Date(selectedReport.date), 'MMMM dd, yyyy - HH:mm')}</p>
              </div>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => window.print()}>
                <Download className="w-4 h-4" /> Export PDF
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Patient Information</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-bold text-lg text-slate-900">{selectedReport.patient.first_name} {selectedReport.patient.last_name}</p>
                  <p className="text-sm text-slate-600 mt-1">MRN: {selectedReport.patient.patient_id || 'N/A'}</p>
 