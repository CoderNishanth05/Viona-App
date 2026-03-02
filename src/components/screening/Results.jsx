// Force rebuild to clear Vite cache
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateCombinedRisk } from '../screeningLogic';
import { ShieldAlert, ShieldCheck, Shield, Activity, Save, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip } from 'recharts';

export default function Results({ breathData, elisaData, patientId, onSave }) {
  const { combinedScore, riskLevel, likelyCancer } = calculateCombinedRisk(breathData, elisaData.elisaScore);

  const radarData = [
    { subject: 'MQ-3', A: breathData.mq3, fullMark: 1023 },
    { subject: 'MQ-135', A: breathData.mq135, fullMark: 1023 },
    { subject: 'MQ-138', A: breathData.mq138, fullMark: 1023 },
    { subject: 'MQ-137', A: breathData.mq137, fullMark: 1023 },
  ];

  const RiskIcon = riskLevel === 'High' ? ShieldAlert : riskLevel === 'Medium' ? Shield : ShieldCheck;
  const riskColor = riskLevel === 'High' ? 'text-rose-500' : riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500';
  const riskBg = riskLevel === 'High' ? 'bg-rose-50' : riskLevel === 'Medium' ? 'bg-amber-50' : 'bg-emerald-50';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className={`p-8 rounded-2xl flex items-center justify-between border ${
        riskLevel === 'High' ? 'border-rose-200 bg-rose-50/50' : 
        riskLevel === 'Medium' ? 'border-amber-200 bg-amber-50/50' : 
        'border-emerald-200 bg-emerald-50/50'
      }`}>
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-full bg-white shadow-sm border ${
            riskLevel === 'High' ? 'border-rose-100' : riskLevel === 'Medium' ? 'border-amber-100' : 'border-emerald-100'
          }`}>
            <RiskIcon className={`w-12 h-12 ${riskColor}`} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">
              {riskLevel} Risk Detected
            </h2>
            <p className="text-slate-600 text-lg">Combined Algorithm Score: <span className="font-bold text-slate-900">{combinedScore.toFixed(1)} / 100</span></p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Associated Pattern</p>
          <p className="text-2xl font-bold text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 inline-block shadow-sm">
            {likelyCancer}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sensor Fingerprint */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-teal-500" />
              E-Nose Fingerprint
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <Radar name="Sensor Value" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown & Guidance */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg">Screening Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">ELISA Biomarker</p>
                  <p className="text-lg font-bold text-slate-900">{elisaData.rawWells.sample} Intensity</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-medium mb-1">Score Contribution</p>
                  <p className="text-lg font-bold text-blue-600">{(elisaData.elisaScore * 0.4).toFixed(1)} pts</p>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="font-semibold text-slate-900 mb-3">Next Steps Guidance:</h4>
                <ul className="space-y-3">
                  {riskLevel === 'Low' && (
                    <li className="flex gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-emerald-500 font-bold">1.</span>
                      No immediate clinical action required. Routine follow-up in 12 months.
                    </li>
                  )}
                  {riskLevel === 'Medium' && (
                    <>
                      <li className="flex gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-amber-500 font-bold">1.</span>
                        Schedule standard lab blood panel within 30 days.
                      </li>
                      <li className="flex gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-amber-500 font-bold">2.</span>
                        Review patient history for related risk factors.
                      </li>
                    </>
                  )}
                  {riskLevel === 'High' && (
                    <>
                      <li className="flex gap-3 text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-100 font-medium">
                        <span className="text-rose-600 font-bold">1.</span>
                        Urgent priority: Order specific imaging (CT/MRI) based on {likelyCancer} pattern.
                      </li>
                      <li className="flex gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-slate-400 font-bold">2.</span>
                        Refer to specialist consultation.
                      </li>
                    </>
                  )}
                </ul>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button 
          size="lg" 
          className="bg-teal-600 hover:bg-teal-700 px-8"
          onClick={() => onSave({ combinedScore, riskLevel, likelyCancer })}
        >
          <Save className="w-5 h-5 mr-2" /> Save to Record
        </Button>
      </div>

    </div>
  );
}