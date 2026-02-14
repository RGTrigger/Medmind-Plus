import { useState } from 'react';
import { AlertTriangle, Info, Heart } from 'lucide-react';
import { searchSymptom, SYMPTOM_DB, type SymptomEntry } from '@/lib/medicine-database';
import { getRelevantSymptomSuggestions } from '@/lib/history-intelligence';

const DEFAULT_SYMPTOMS = ['headache', 'fever', 'cough', 'stomach pain', 'fatigue', 'nausea', 'dizziness', 'back pain'];

export default function SymptomCheckerTab() {
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState<SymptomEntry[]>([]);
  const [searched, setSearched] = useState(false);

  const personalizedSuggestions = getRelevantSymptomSuggestions();
  const quickSymptoms = personalizedSuggestions.length > 0
    ? [...new Set([...personalizedSuggestions, ...DEFAULT_SYMPTOMS])].slice(0, 8)
    : DEFAULT_SYMPTOMS;

  const handleAnalyze = (q?: string) => {
    const query = (q || symptoms).trim();
    if (!query) return;
    setSearched(true);
    // Search for each word/phrase
    const found = searchSymptom(query);
    if (found.length === 0) {
      // Try splitting by comma
      const parts = query.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
      const allResults: SymptomEntry[] = [];
      for (const part of parts) {
        allResults.push(...searchSymptom(part));
      }
      setResults([...new Map(allResults.map(r => [r.symptom, r])).values()]);
    } else {
      setResults(found);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="gradient-symptom px-6 py-4 text-primary-foreground font-bold text-lg flex items-center gap-2">
            <AlertTriangle size={20} /> ⚠️ Symptom Checker
            <span className="ml-auto text-xs font-normal opacity-80">{SYMPTOM_DB.length}+ symptoms</span>
          </div>
          <div className="p-6 space-y-4">
            <label className="block text-sm font-semibold text-foreground">Describe your symptoms</label>
            <textarea
              className="w-full rounded-xl border-2 border-input px-4 py-3 text-base bg-background/50 focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-y"
              placeholder="e.g., headache, fever, sore throat..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />
            <button
              onClick={() => handleAnalyze()}
              className="w-full gradient-symptom text-primary-foreground font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              🔍 Analyze Symptoms
            </button>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {personalizedSuggestions.length > 0 ? '⭐ Suggested for you:' : 'Common symptoms:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickSymptoms.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSymptoms(s); handleAnalyze(s); }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      personalizedSuggestions.includes(s)
                        ? 'bg-accent/20 text-accent hover:bg-accent/30 ring-1 ring-accent/30'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="gradient-teal px-6 py-4 text-primary-foreground font-bold text-lg flex items-center gap-2">
            📋 Analysis Results
          </div>
          <div className="p-6 min-h-[200px]">
            {!searched ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-5xl mb-3">💗</div>
                <p className="text-lg">Enter symptoms to get insights</p>
                <p className="text-sm mt-1">We'll check our database and provide guidance</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map(result => (
                  <div key={result.symptom} className="space-y-3">
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                      {result.icon} {result.symptom}
                    </h3>
                    <p className="text-foreground">{result.description}</p>

                    <div className="bg-muted/30 rounded-xl p-4">
                      <p className="text-xs font-bold text-foreground mb-2">🔍 Possible Causes:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.possibleCauses.map(c => (
                          <span key={c} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">{c}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                      <p className="text-xs font-bold text-accent mb-1">💡 Self-Care Advice:</p>
                      <p className="text-sm text-foreground leading-relaxed">{result.advice}</p>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4">
                      <p className="text-xs font-bold text-foreground mb-2">💊 Suggested Remedies:</p>
                      <ul className="space-y-1">
                        {result.remedies.map(r => (
                          <li key={r} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Heart size={12} className="text-primary mt-1 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                      <p className="text-xs font-bold text-destructive mb-1">🚨 See a Doctor If:</p>
                      <p className="text-sm text-destructive leading-relaxed">{result.whenToSeeDoctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-5xl mb-3">🤔</div>
                <p className="text-lg font-semibold">No matching symptoms found</p>
                <p className="text-sm mt-1">Try different terms or use the quick buttons</p>
              </div>
            )}
          </div>
          <div className="px-6 pb-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <Info size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary">
                <strong>Important:</strong> This is not medical advice. Always consult a healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
