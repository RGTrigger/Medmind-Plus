// MedMind+ Data Layer - localStorage based

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  createdAt: string;
}

export interface MedicineLog {
  id: string;
  medicineId: string;
  action: 'taken' | 'missed';
  timestamp: string;
}

export interface MedicineInfo {
  name: string;
  description: string;
  category: string;
  icon: string;
}

export interface SymptomResult {
  symptom: string;
  advice: string;
  category: string;
}

const MEDICINES_KEY = 'medmind_medicines';
const LOGS_KEY = 'medmind_logs';

// Dataset from dataset.txt
const MEDICINE_DATABASE: Record<string, MedicineInfo> = {
  paracetamol: {
    name: 'Paracetamol (Acetaminophen)',
    description: 'Pain reliever & fever reducer. Dose: 500-1000mg every 4-6 hours. Max: 4g daily. Avoid alcohol. Side effects: rare liver issues.',
    category: 'medicine_info',
    icon: '💊',
  },
  ibuprofen: {
    name: 'Ibuprofen',
    description: 'Anti-inflammatory pain reliever. Dose: 200-400mg every 4-6 hours. Take with food. Avoid if pregnant. May cause stomach irritation.',
    category: 'medicine_info',
    icon: '🔥',
  },
  aspirin: {
    name: 'Aspirin',
    description: 'Pain relief & blood thinner. Dose: 325-650mg every 4-6 hours. Take with food. Avoid if allergic. May cause stomach upset.',
    category: 'medicine_info',
    icon: '💉',
  },
  amoxicillin: {
    name: 'Amoxicillin',
    description: 'Broad-spectrum antibiotic for bacterial infections. Take as prescribed, usually 2-3 times daily. Complete full course. May cause diarrhea.',
    category: 'medicine_info',
    icon: '🦠',
  },
  'vitamin d3': {
    name: 'Vitamin D3',
    description: 'Essential for bone health & immune system. Daily dose: 600-800 IU. Best absorbed with fatty foods. Deficiency common in winter months.',
    category: 'medicine_info',
    icon: '☀️',
  },
  omeprazole: {
    name: 'Omeprazole',
    description: 'Reduces stomach acid production. Take 30 minutes before meals. Used for ulcers, GERD. Long-term use may affect calcium absorption.',
    category: 'medicine_info',
    icon: '🧪',
  },
};

const SYMPTOM_DATABASE: Record<string, SymptomResult> = {
  headache: {
    symptom: 'Headache',
    advice: 'Rest in quiet, dark room. Stay hydrated. Take pain reliever if needed. Seek medical help if severe, sudden, or with other symptoms.',
    category: 'symptom_checker',
  },
  fever: {
    symptom: 'Fever',
    advice: 'Rest, stay hydrated, monitor temp. Take acetaminophen if needed. Seek medical help if: >103°F, persistent >3 days, or with severe symptoms.',
    category: 'symptom_checker',
  },
  cough: {
    symptom: 'Cough',
    advice: 'Stay hydrated, use honey for soothing, avoid irritants. Seek help if: persistent >2 weeks, bloody, or with fever/chest pain.',
    category: 'symptom_checker',
  },
  nausea: {
    symptom: 'Nausea',
    advice: 'Small, frequent meals. Avoid fatty/spicy foods. Stay hydrated with clear fluids. Seek help if: severe, persistent, or with other symptoms.',
    category: 'symptom_checker',
  },
  fatigue: {
    symptom: 'Fatigue',
    advice: 'Ensure adequate sleep, eat balanced diet, exercise moderately. Seek help if: persistent, severe, or with other concerning symptoms.',
    category: 'symptom_checker',
  },
  dizziness: {
    symptom: 'Dizziness',
    advice: 'Sit or lie down, avoid sudden movements, stay hydrated. Seek help if: severe, persistent, or with chest pain/headache.',
    category: 'symptom_checker',
  },
  stomach: {
    symptom: 'Stomach Pain',
    advice: 'Rest, eat bland foods, stay hydrated. Avoid spicy/fatty foods. Seek help if: severe, persistent, or with fever/vomiting.',
    category: 'symptom_checker',
  },
};

// Medicine CRUD
export function getMedicines(): Medicine[] {
  const data = localStorage.getItem(MEDICINES_KEY);
  return data ? JSON.parse(data) : [];
}

export function addMedicine(med: Omit<Medicine, 'id' | 'createdAt'>): Medicine {
  const medicines = getMedicines();
  const newMed: Medicine = {
    ...med,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  medicines.push(newMed);
  localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
  return newMed;
}

export function deleteMedicine(id: string): void {
  const medicines = getMedicines().filter(m => m.id !== id);
  localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
  // Also delete related logs
  const logs = getLogs().filter(l => l.medicineId !== id);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

// Logs
export function getLogs(): MedicineLog[] {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function logAction(medicineId: string, action: 'taken' | 'missed'): void {
  const logs = getLogs();
  logs.push({
    id: crypto.randomUUID(),
    medicineId,
    action,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

// Summary
export function getDailySummary() {
  const medicines = getMedicines();
  const logs = getLogs();
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.timestamp.startsWith(today));

  const taken = todayLogs.filter(l => l.action === 'taken').length;
  const missed = todayLogs.filter(l => l.action === 'missed').length;
  const loggedMedicineIds = new Set(todayLogs.map(l => l.medicineId));
  const pending = medicines.filter(m => !loggedMedicineIds.has(m.id)).length;

  return { total: medicines.length, taken, missed, pending };
}

export function getTodaySchedule(): Medicine[] {
  const medicines = getMedicines();
  const logs = getLogs();
  const today = new Date().toISOString().split('T')[0];
  const loggedIds = new Set(logs.filter(l => l.timestamp.startsWith(today)).map(l => l.medicineId));
  return medicines.filter(m => !loggedIds.has(m.id));
}

export function getMissedDoses(): MedicineLog[] {
  const logs = getLogs();
  const today = new Date().toISOString().split('T')[0];
  return logs.filter(l => l.timestamp.startsWith(today) && l.action === 'missed');
}

// Medicine Info
export function searchMedicineInfo(query: string): MedicineInfo | null {
  const key = query.toLowerCase().trim();
  if (MEDICINE_DATABASE[key]) return MEDICINE_DATABASE[key];
  for (const [k, v] of Object.entries(MEDICINE_DATABASE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

export function getAllMedicineInfo(): MedicineInfo[] {
  return Object.values(MEDICINE_DATABASE);
}

// Symptoms
export function checkSymptom(query: string): SymptomResult | null {
  const key = query.toLowerCase().trim();
  if (SYMPTOM_DATABASE[key]) return SYMPTOM_DATABASE[key];
  for (const [k, v] of Object.entries(SYMPTOM_DATABASE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

export const COMMON_SYMPTOMS = ['headache', 'fever', 'cough', 'stomach', 'fatigue', 'nausea'];

// Greeting
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning! 🌅 How can I help you with your health today?';
  if (hour >= 12 && hour < 17) return 'Good afternoon! ☀️ How can I assist you with your health needs?';
  if (hour >= 17 && hour < 21) return 'Good evening! 🌆 How can I help you with your health today?';
  return 'Good night! 🌙 How can I assist you with your health needs?';
}

// CSV Report Generation
export function generateCSVReport(): string {
  const medicines = getMedicines();
  const logs = getLogs();
  let csv = 'Medicine Name,Dosage,Frequency,Time,Action,Timestamp\n';

  for (const log of logs) {
    const med = medicines.find(m => m.id === log.medicineId);
    if (med) {
      csv += `"${med.name}","${med.dosage}","${med.frequency}","${med.time}","${log.action}","${log.timestamp}"\n`;
    }
  }

  // Add medicines without logs
  const loggedIds = new Set(logs.map(l => l.medicineId));
  for (const med of medicines) {
    if (!loggedIds.has(med.id)) {
      csv += `"${med.name}","${med.dosage}","${med.frequency}","${med.time}","scheduled",""\n`;
    }
  }

  return csv;
}

export function downloadReport(): void {
  const csv = generateCSVReport();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medmind-report-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
