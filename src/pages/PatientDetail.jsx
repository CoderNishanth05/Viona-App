import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function PatientDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => base44.entities.Patient.get(patientId),
    enabled: !!patientId
  });

  const { data: screenings = [] } = useQuery({
    queryKey: ['screenings', patientId],
    queryFn: async () => {
      // filtering via code for simplicity since it's a demo, could use .filter() in SDK
      const all = await base44.entities.Screening.list('-date', 100);
      return all.filter(s => s.patient_id === patientId);
    },
    enabled: !!patientId
  });

  if (!patient) return null;

  // Prepare chart data (risk scores over time)
  const chartData = [...screenings].reverse().map(s => ({
    date: format(new Date(s.date), 'MMM dd'),
    score: s.results?.combinedScore || 0,
    risk: s.risk_score
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex gap-8 items-start">
        <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
          <User className="w-12 h-12 text-teal-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{patient.first_name} {patient.last_name}</h1>
          <div className="flex gap-6 text-sm text-slate-600">
            <p><span className="font-medium text-slate-900">ID:</span> {patient.patient_id || 'N/A'}</p>
            <p><span className="font-medium text-slate-900">DOB:</span> {patient.dob ? format(new Date(patient.dob), 'MMM dd, yyyy') : 'N/A'}</p>
            <p className="capitalize"><span className="font-medium text-slate-900">Gender:</span> {patient.gender || 'N/A'}</p>
          </div>
          {patient.notes && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700">
              <span className="font-semibold block mb-1">Notes:</span>
              {patient.notes}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* History Chart */}
        <Card className="col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Risk Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                    <YAxis domain={[0, 100]} tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value, name) => [value.toFixed(1), 'Risk Score']}
                    />
                    <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={3} dot={{r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
 