export const TRAFFIC_COLORS = {
  'Free-flow': '#10B981', // Emerald / Teal
  'Moderate': '#2563EB',  // Cobalt Blue
  'Heavy': '#F59E0B',     // Amber Orange
  'Gridlock': '#EF4444',  // Crimson Red
  'Unlabeled': '#64748B'  // Neutral Slate
};

export const TRAFFIC_BG_COLORS = {
  'Free-flow': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Moderate': 'bg-blue-50 text-blue-700 border-blue-200',
  'Heavy': 'bg-amber-50 text-amber-700 border-amber-200',
  'Gridlock': 'bg-red-50 text-red-700 border-red-200',
  'Unlabeled': 'bg-slate-50 text-slate-700 border-slate-200'
};

export const EXCLUDED_COLUMNS = ['timestamp', 'road_segment_id', 'label'];

export const REFERENCE_DATASET = {
  title: 'VANET Traffic Flow Dataset (Original Project Reference)',
  filename: 'vanet_traffic_data.csv',
  totalObservations: 195714,
  totalColumns: 27,
  numericalFeatures: 24,
  roadSegments: 500,
  trafficConditions: 4,
  missingValues: 0,
  duplicates: 0,
  distribution: {
    'Free-flow': 57812,
    'Moderate': 54018,
    'Heavy': 47440,
    'Gridlock': 36444
  },
  pcaFull: {
    pc1: 83.68,
    pc2: 8.85,
    total: 92.53
  },
  pcaSample: {
    pc1: 84.13,
    pc2: 8.83,
    total: 92.61 // Originally documented 92.61%
  },
  tsneSample: {
    size: 5000,
    freeflow: 1477,
    moderate: 1380,
    heavy: 1212,
    gridlock: 931,
    observationNotes: 'Free-flow observations form a coherent distinct grouping, while Heavy and Gridlock conditions exhibit substantial non-linear overlap reflecting congested bottleneck dynamics.'
  },
  negativeValueColumns: [
    { col: 'avg_wait_time_s', note: 'May indicate sensor baseline offset or synthetic normalization artifact' },
    { col: 'queue_length_veh', note: 'Vehicle counts expected >= 0; likely floating-point noise or calibration artifact' },
    { col: 'avg_accel_ms2', note: 'Physically valid: negative acceleration represents deceleration/braking' },
    { col: 'heading_deg', note: 'Angle measurements occasionally normalized or indexed relative to grid' },
    { col: 'incident_num', note: 'Expected non-negative incident count; domain validation suggested' },
    { col: 'rain_intensity_mmph', note: 'Precipitation rate expected >= 0; minor sensor zero-drift' },
    { col: 'rssi_dbm', note: 'Physically valid: Received Signal Strength Indicator in dBm is inherently negative (e.g. -73 dBm)' },
    { col: 'congestion_pressure', note: 'Compound index; slight negative offset from regression residuals' },
    { col: 'acceleration_directionality', note: 'Vectorial projection; negative indicates opposing vehicle motion' }
  ]
};
