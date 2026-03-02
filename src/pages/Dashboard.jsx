import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date', 5)
  });

  const { data: screenings = [] } = useQuery({
    queryKey: ['screenings'],
    queryFn: () => base44.entities.Screening.list('-date', 10)
  });

  const highRiskScreenings = screenings.filter(s => s.risk_score === 'High');

  const stats = [
    { title: 'Total Patients', value: patients.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Screenings Today', value: screenings.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length, icon: Activity, color: 'text-teal-500', bg: 'bg-teal-50' },
    { title: 'Pending Reports', value: screenings.filter(s => s.status === 'in_progress').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'High Risk Detected', value: highRiskScreenings.length, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of recent screenings and patient activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg text-slate-800">Recent Patients</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {patients.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No patients found.</div>
              ) : (
                patients.map(patient => (
                  <div key={patient.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">{patient.first_name} {patient.last_name}</p>
                      <p className="text-sm text-slate-500">ID: {patient.patient_id}</p>
                    </div>
                    <Link 
                      to={createPageUrl(`PatientDetail?id=${patient.id}`)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      View Profile
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg text-slate-800">Recent Screenings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {screenings.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No screenings found.</div>
              ) : (
                screenings.map(screening => (
                  <div key={screening.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">
                        {format(new Date(screening.date), 'MMM dd, yyyy HH:mm')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500">
                          {screening.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                        {screening.risk_score && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            screening.risk_score === 'High' ? 'bg-rose-100 text-rose-700' :
                            screening.risk_score === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {screening.risk_score} Risk
                          </span>
                        )}
                      </div>
                    </div>
                    <Link 
                      to={createPageUrl(`Reports?id=${screening.id}`)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      View Report
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}