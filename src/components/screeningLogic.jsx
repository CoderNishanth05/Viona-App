export const generateBreathData = (scenario, randomize = false) => {
  // Base values mapping (0-1023 range)
  const baselines = {
    'Healthy': { mq3: 120, mq135: 200, mq138: 150, mq137: 180, temp: 36.5, humidity: 85 },
    'Lung-like': { mq3: 130, mq135: 750, mq138: 680, mq137: 220, temp: 36.7, humidity: 88 },
    'Liver-like': { mq3: 820, mq135: 250, mq138: 190, mq137: 200, temp: 36.6, humidity: 84 },
    'PDAC-like': { mq3: 150, mq135: 300, mq138: 550, mq137: 810, temp: 36.5, humidity: 86 },
    'Breast-like': { mq3: 140, mq135: 520, mq138: 210, mq137: 740, temp: 36.4, humidity: 85 }
  };

  const base = baselines[scenario] || baselines['Healthy'];

  const addNoise = (val, range = 0.1) => {
    if (!randomize) return val;
    const variation = val * range;
    return Math.max(0, Math.min(1023, Math.round(val + (Math.random() * variation * 2 - variation))));
  };

  return {
    mq3: addNoise(base.mq3, 0.15),
    mq135: addNoise(base.mq135, 0.15),
    mq138: addNoise(base.mq138, 0.15),
    mq137: addNoise(base.mq137, 0.15),
    temp: parseFloat((addNoise(base.temp, 0.02)).toFixed(1)),
    humidity: parseFloat((addNoise(base.humidity, 0.05)).toFixed(1))
  };
};

export const getSensorActivation = (value, threshold = 400) => {
  if (value < threshold * 0.6) return 'Normal';
  if (value < threshold) return 'Elevated';
  return 'High';
};

export const calculateCombinedRisk = (breathData, elisaScore) => {
  // Normalize breath data to a score 0-100
  const maxSensor = Math.max(breathData.mq3, breathData.mq135, breathData.mq138, breathData.mq137);
  const breathScore = Math.min(100, (maxSensor / 1023) * 100);
  
  // Weights
  const breathWeight = 0.6;
  const elisaWeight = 0.4;
  
  const combinedScore = (breathScore * breathWeight) + (elisaScore * elisaWeight);
  
  let riskLevel = 'Low';
  if (combinedScore > 40) riskLevel = 'Medium';
  if (combinedScore > 75) riskLevel = 'High';

  // Determine likely pattern
  let likelyCancer = 'None detected';
  if (riskLevel !== 'Low') {
    const patterns = [
      { name: 'Lung', score: breathData.mq135 + breathData.mq138 },
      { name: 'Liver', score: breathData.mq3 * 1.5 },
      { name: 'PDAC', score: breathData.mq137 + breathData.mq138 },
      { name: 'Breast', score: breathData.mq137 + breathData.mq135 }
    ];
    patterns.sort((a, b) => b.score - a.score);
    if (patterns[0].score > 800) {
      likelyCancer = patterns[0].name;
    }
  }

  return { combinedScore, riskLevel, likelyCancer };
};