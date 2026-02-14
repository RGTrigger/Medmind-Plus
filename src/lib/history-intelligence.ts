// History-based intelligence: uses medicine logs to provide personalized insights

import { getMedicines, getLogs, type Medicine, type MedicineLog } from './medmind-data';
import { MEDICINE_DB, SYMPTOM_DB, type MedicineEntry } from './medicine-database';

export interface PersonalInsight {
  type: 'interaction' | 'adherence' | 'timing' | 'suggestion';
  icon: string;
  title: string;
  message: string;
}

// Check if any of the user's current medicines interact with a searched medicine
export function getInteractionWarnings(searchedMedicine: string): PersonalInsight[] {
  const userMeds = getMedicines();
  if (userMeds.length === 0) return [];

  const insights: PersonalInsight[] = [];
  const searched = searchedMedicine.toLowerCase();

  // Common known interactions (simplified)
  const interactions: Record<string, string[]> = {
    'warfarin': ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'omeprazole', 'metronidazole', 'fluoxetine', 'sertraline'],
    'aspirin': ['ibuprofen', 'naproxen', 'warfarin', 'clopidogrel', 'methotrexate'],
    'ibuprofen': ['aspirin', 'warfarin', 'lisinopril', 'losartan', 'methotrexate', 'clopidogrel'],
    'metformin': ['alcohol', 'contrast dye'],
    'lisinopril': ['ibuprofen', 'naproxen', 'diclofenac', 'potassium'],
    'losartan': ['ibuprofen', 'naproxen', 'diclofenac', 'potassium'],
    'clopidogrel': ['omeprazole', 'aspirin'],
    'methotrexate': ['ibuprofen', 'naproxen', 'aspirin'],
    'levothyroxine': ['calcium', 'iron', 'omeprazole', 'pantoprazole'],
    'ciprofloxacin': ['calcium', 'iron', 'antacids'],
    'alprazolam': ['alcohol', 'tramadol', 'zolpidem'],
    'diazepam': ['alcohol', 'tramadol', 'zolpidem'],
    'sildenafil': ['nitrates', 'amlodipine'],
  };

  for (const userMed of userMeds) {
    const userMedName = userMed.name.toLowerCase();
    for (const [drug, interactsWith] of Object.entries(interactions)) {
      if (searched.includes(drug) && interactsWith.some(i => userMedName.includes(i))) {
        insights.push({
          type: 'interaction',
          icon: '⚠️',
          title: 'Possible Interaction',
          message: `${searchedMedicine} may interact with your current medicine "${userMed.name}". Please consult your doctor or pharmacist.`,
        });
      }
      if (userMedName.includes(drug) && interactsWith.some(i => searched.includes(i))) {
        insights.push({
          type: 'interaction',
          icon: '⚠️',
          title: 'Possible Interaction',
          message: `${searchedMedicine} may interact with your current medicine "${userMed.name}". Please consult your doctor or pharmacist.`,
        });
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return insights.filter(i => {
    if (seen.has(i.message)) return false;
    seen.add(i.message);
    return true;
  });
}

// Get adherence stats for personalized feedback
export function getAdherenceInsights(): PersonalInsight[] {
  const logs = getLogs();
  const medicines = getMedicines();
  if (logs.length === 0 || medicines.length === 0) return [];

  const insights: PersonalInsight[] = [];
  const taken = logs.filter(l => l.action === 'taken').length;
  const missed = logs.filter(l => l.action === 'missed').length;
  const total = taken + missed;

  if (total > 0) {
    const adherenceRate = Math.round((taken / total) * 100);
    if (adherenceRate >= 90) {
      insights.push({ type: 'adherence', icon: '🌟', title: 'Excellent Adherence!', message: `You've taken ${adherenceRate}% of your medicines on time. Keep up the great work!` });
    } else if (adherenceRate >= 70) {
      insights.push({ type: 'adherence', icon: '👍', title: 'Good Adherence', message: `Your adherence rate is ${adherenceRate}%. Try setting reminders to improve consistency.` });
    } else {
      insights.push({ type: 'adherence', icon: '💪', title: 'Room for Improvement', message: `Your adherence rate is ${adherenceRate}%. Missing medicines can affect your health. Consider using the reminders feature.` });
    }
  }

  // Check for frequently missed medicines
  const missedByMed: Record<string, number> = {};
  for (const log of logs.filter(l => l.action === 'missed')) {
    missedByMed[log.medicineId] = (missedByMed[log.medicineId] || 0) + 1;
  }
  for (const [medId, count] of Object.entries(missedByMed)) {
    if (count >= 3) {
      const med = medicines.find(m => m.id === medId);
      if (med) {
        insights.push({ type: 'adherence', icon: '📋', title: `Frequently Missed: ${med.name}`, message: `You've missed ${med.name} ${count} times. Talk to your doctor if you're having trouble with this medicine.` });
      }
    }
  }

  return insights;
}

// Suggest relevant symptom info based on user's medicines
export function getRelevantSymptomSuggestions(): string[] {
  const medicines = getMedicines();
  const suggestions = new Set<string>();

  for (const med of medicines) {
    const name = med.name.toLowerCase();
    // If taking pain meds, they might have pain-related symptoms
    if (['paracetamol', 'ibuprofen', 'aspirin', 'naproxen'].some(p => name.includes(p))) {
      suggestions.add('headache');
      suggestions.add('muscle pain');
    }
    if (['omeprazole', 'pantoprazole', 'ranitidine'].some(p => name.includes(p))) {
      suggestions.add('stomach pain');
      suggestions.add('nausea');
    }
    if (['salbutamol', 'montelukast', 'fluticasone'].some(p => name.includes(p))) {
      suggestions.add('cough');
      suggestions.add('shortness of breath');
    }
    if (['cetirizine', 'loratadine', 'fexofenadine'].some(p => name.includes(p))) {
      suggestions.add('allergic reaction');
    }
    if (['metformin', 'glimepiride', 'insulin'].some(p => name.includes(p))) {
      suggestions.add('dizziness');
      suggestions.add('fatigue');
    }
  }

  return [...suggestions].slice(0, 6);
}
