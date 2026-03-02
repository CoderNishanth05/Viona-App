import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import BreathScan from '../components/screening/BreathScan';
import ElisaInput from '../components/screening/ElisaInput';
import Results from '../components/screening/Results';
import { ChevronRight } from 'lucide-react';

export default function NewScreening() {
  const [step, setStep] = useState(0); // 0: select patient, 1: breath, 2: elisa, 3: results
  const [patientId, setPatientId] = useState('');
  
  const [screeningData, setScreeningData] = useState({
    breath: null,
    elisa: null,
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date', 100)
  });

  const saveScreening = useMutation({
    mutationFn: (resultsData) => base44.entities.Screening.create({
      patient_id: patientId,
      date: new Date().toISOString(),
      status: 'completed',
      breath_data: screeningData.breath,
      elisa_data: screeningData.elisa,
      results: resultsData,
      risk_score: resultsData.riskLevel
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['screenings']);
      navigate(createPageUrl(`Reports?id=${data.id}`));
    }
  });

  const steps = [
    { id: 0, label: 'Patient Selection' },
    { id: 1, label: 'E-Nose Scan' },
    { id: 2, label: 'ELISA Input' },
    { id: 3, label: 'Analysis Results' }
  ];

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
      
      {/* Wizard Header */}
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Screening</h1>
        <p className="text-slate-500 mt-1">Multi-modal prototype screening wizard.</p>
        
        <div className="flex items-center mt-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step === s.id ? 'bg-teal-600 text-white shadow-md' : 
                  step > s.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {s.id + 1}
                </div>
                <span className={`ml-3 font-medium text-sm ${
                  step === s.id ? 'text-teal-900' : step > s.id ? 'text-teal-700' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${step > i ? 'bg-teal-200' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Wizard Content */}
 