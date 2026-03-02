import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, AlertTriangle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ElisaInput({ onComplete }) {
  // 3 wells: Pos Control, Neg Control, Patient Sample
  const [wells, setWells] = useState({
    pos: 'Medium',
    neg: 'Clear',
    sample: 'Clear'
  });

  const [hasError, setHasError] = useState(false);

  const colors = {
    'Clear': 'bg-slate-100 border-slate-300',
    'Light': 'bg-blue-200 border-blue-400',
    'Medium': 'bg-blue-400 border-blue-600',
    'Dark': 'bg-blue-600 border-blue-800'
  };

  const scores = {
    'Clear': 0,
    'Light': 25,
    'Medium': 60,
    'Dark': 100
  };

  const validateAndComplete = () => {
    // Basic validation: Pos control should be dark/medium, Neg should be clear/light
    if (scores[wells.pos] < 50 || scores[wells.neg] > 30) {
      setHasError(true);
      return;
    }
    
    setHasError(false);
    onComplete({
      rawWells: wells,
      elisaScore: scores[wells.sample],
      validControls: true
    });
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg">1. Upload Assay Photo</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer min-h-[250px]">
            <Upload className="w-10 h-10 text-slate-400 mb-4" />
            <p className="font-semibold text-slate-700">Upload ELISA photo</p>
            <p className="text-sm text-slate-500 mt-1">JPEG or PNG, max 5MB</p>
            <Button variant="outline" className="mt-4">Select File</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg">2. Visual Interpretation</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-6">Select the color intensity for each well matching the physical assay.</p>
            
            <div className="space-y-6">
              {[
                { id: 'pos', label: 'Positive Control (+)' },
                { id: 'neg', label: 'Negative Control (-)' },
                { id: 'sample', label: 'Patient Sample' }
              ].map(well => (
                <div key={well.id} className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 w-32">{well.label}</span>
                  <div className="flex gap-2">
                    {Object.keys(colors).map(intensity => (
                      <button
                        key={intensity}
                        onClick={() => setWells({...wells, [well.id]: intensity})}
                        className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${colors[intensity]} ${
                          wells[well.id] === intensity ? 'ring-4 ring-teal-500 ring-offset-2 scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={intensity}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {hasError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert className="mt-6 bg-rose-50 border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <AlertDescription className="text-rose-700 font-medium ml-2">
                    Control well values are out of expected bounds. Assay may be invalid.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Button 
          className="w-full py-6 text-lg bg-teal-600 hover:bg-teal-700 shadow-md"
          onClick={validateAndComplete}
        >
          Compute Results <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}