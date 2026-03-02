import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const [settings, setSettings] = useState({
    scenario: 'Healthy',
    randomize: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('viona_demo_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('viona_demo_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Demo Settings</h1>
        <p className="text-slate-500 mt-1">Configure the simulated data generation for the screening wizard.</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-6 space-y-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Simulated Patient Scenario</h3>
              <p className="text-sm text-slate-500 mb-4">
                Select the clinical pattern that the E-Nose sensors and ELISA tests will simulate during the next screening.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Healthy', 'Lung-like', 'Liver-like', 'PDAC-like', 'Breast-like'].map(scenario => (
                <div 
                  key={scenario}
                  onClick={() => saveSettings({...settings, scenario})}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.scenario === scenario 
                      ? 'border-teal-500 bg-teal-50/50' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{scenario}</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      settings.scenario === scenario ? 'border-teal-500' : 'border-slate-300'
                    }`}>
                      {settings.scenario === scenario && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    {scenario === 'Healthy' && 'Normal baseline levels across all sensors.'}
                    {scenario === 'Lung-like' && 'Elevated MQ-135 and MQ-138 levels.'}
                    {scenario === 'Liver-like' && 'Significantly elevated MQ-3 levels.'}
                    {scenario === 'PDAC-like' && 'Elevated MQ-137 and MQ-138 levels.'}
                    {scenario === 'Breast-like' && 'Elevated MQ-137 and MQ-135 levels.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold text-slate-900">Randomize Variation</Label>
              <p className="text-sm text-slate-500">Add realistic noise to sensor readings (±15%).</p>
            </div>
            <Switch 
              checked={settings.randomize} 
              onCheckedChange={(checked) => saveSettings({...settings, randomize: checked})}
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}