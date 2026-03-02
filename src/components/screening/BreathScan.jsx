// Force rebuild to clear Vite cache
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Thermometer, Droplets, CheckCircle2 } from 'lucide-react';
import { generateBreathData, getSensorActivation } from '../screeningLogic';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function BreathScan({ onComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isScanning && progress < 100) {
      const timer = setInterval(() => {
        setProgress(p => Math.min(100, p + (Math.random() * 5 + 2)));
      }, 200);
      return () => clearInterval(timer);
    } else if (isScanning && progress >= 100 && !scanComplete) {
      setIsScanning(false);
      setScanComplete(true);
      
      const settings = JSON.parse(localStorage.getItem('viona_demo_settings') || '{"scenario":"Healthy","randomize":true}');
      const generatedData = generateBreathData(settings.scenario, settings.randomize);
      setData(generatedData);
      
      setTimeout(() => {
        onComplete(generatedData);
      }, 2500); // Auto advance after showing results briefly
    }
  }, [isScanning, progress, scanComplete, onComplete]);

  const startScan = () => {
    setIsScanning(true);
    setProgress(0);
    setScanComplete(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[500px]">
      
      {!isScanning && !scanComplete && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <div className="w-32 h-32 mx-auto bg-teal-50 rounded-full flex items-center justify-center">
            <Wind className="w-16 h-16 text-teal-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Ready for Breath Scan</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Please instruct the patient to blow steadily into the E-Nose mouthpiece for 10 seconds.
            </p>
          </div>
          <button 
            onClick={startScan}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            Start Scan
          </button>
        </motion.div>
      )}

      {isScanning && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-8"
        >
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute inset-0 border-8 border-teal-100 rounded-full"></div>
            <div 
              className="absolute inset-0 border-8 border-teal-500 rounded-full transition-all duration-200"
              style={{ clipPath: `polygon(50% 50%, 50% 0, ${progress < 50 ? 100 : 100}% ${progress < 50 ? progress * 2 : 100}%, ${progress > 50 ? (progress-50)*2 : 100}% 100%, 0 100%, 0 0)` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center flex-col animate-pulse">
              <Wind className="w-10 h-10 text-teal-600 mb-2" />
              <span className="text-3xl font-bold text-slate-900">{Math.round(progress)}%</span>
            </div>
          </div>
          <p className="text-lg font-medium text-slate-600 animate-pulse">Analyzing VOC patterns...</p>
        </motion.div>
      )}

      {scanComplete && data && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-6"
        >
          <div className="flex items-center justify-center gap-3 text-emerald-600 mb-8">
            <CheckCircle2 className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Scan Complete</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'mq3', label: 'Alcohol / Benzene (MQ-3)', val: data.mq3, max: 1023 },
              { id: 'mq135', label: 'Air Quality (MQ-135)', val: data.mq135, max: 1023 },
              { id: 'mq138', label: 'Alcohols / VOCs (MQ-138)', val: data.mq138, max: 1023 },
              { id: 'mq137', label: 'Ammonia / CO (MQ-137)', val: data.mq137, max: 1023 }
            ].map(sensor => {
              const activation = getSensorActivation(sensor.val);
              const color = activation === 'High' ? 'bg-rose-500' : activation === 'Elevated' ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <Card key={sensor.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2 truncate">{sensor.label}</p>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-2xl font-bold text-slate-900">{sensor.val}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        activation === 'High' ? 'text-rose-700 bg-rose-100' : 
                        activation === 'Elevated' ? 'text-amber-700 bg-amber-100' : 
                        'text-emerald-700 bg-emerald-100'
                      }`}>
                        {activation}
                      </span>
                    </div>
                    <Progress value={(sensor.val / sensor.max) * 100} className={`h-2 ${color}`} />
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
              <Thermometer className="w-5 h-5 text-slate-400" />
              <span className="font-semibold">{data.temp}°C</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
              <Droplets className="w-5 h-5 text-slate-400" />
              <span className="font-semibold">{data.humidity}% RH</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}