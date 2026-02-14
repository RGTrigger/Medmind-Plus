import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { searchMedicine, MEDICINE_DB, getMedicineCategories, getMedicinesByCategory, type MedicineEntry } from '@/lib/medicine-database';
import { getInteractionWarnings } from '@/lib/history-intelligence';

export default function MedicineInfoTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MedicineEntry[]>([]);
  const [searched, setSearched] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showCategory, setShowCategory] = useState<string | null>(null);
  const categories = getMedicineCategories();

  const handleSearch = (q?: string) => {
    const search = (q || query).trim();
    if (!search) return;
    setSearched(true);
    setResults(searchMedicine(search));
    setExpandedIdx(null);
    setShowCategory(null);
  };

  const renderMedicineCard = (med: MedicineEntry, idx: number) => {
    const isExpanded = expandedIdx === idx;
    const warnings = getInteractionWarnings(med.name);

    return (
      <div key={med.name + idx} className="glass-card rounded-2xl overflow-hidden border border-border/50 transition-all hover:shadow-card-hover">
        <button
          className="w-full text-left p-5 flex items-start gap-4"
          onClick={() => setExpandedIdx(isExpanded ? null : idx)}
        >
          <span className="text-4xl">{med.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-primary text-lg">{med.name}</h3>
            <p className="text-sm text-accent font-semibold">{med.category}</p>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{med.description}</p>
          </div>
          {isExpanded ? <ChevronUp className="text-muted-foreground mt-1 flex-shrink-0" size={20} /> : <ChevronDown className="text-muted-foreground mt-1 flex-shrink-0" size={20} />}
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {warnings.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-destructive text-sm font-semibold">{w.message}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-3">
              <InfoRow label="📋 Uses" value={med.uses} />
              <InfoRow label="💊 Dosage" value={med.dosage} />
              <InfoRow label="⚡ Side Effects" value={med.sideEffects} />
              <InfoRow label="⚠️ Warnings" value={med.warnings} />
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mt-2">
              <p className="text-xs text-primary">⚕️ <strong>Disclaimer:</strong> This is for informational purposes only. Always consult your doctor or pharmacist before taking any medication.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="gradient-teal px-6 py-4 text-primary-foreground font-bold text-lg flex items-center gap-2">
          🔍 Medicine Information Hub
          <span className="ml-auto text-xs font-normal opacity-80">{MEDICINE_DB.length}+ medicines</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              className="w-full rounded-xl border-2 border-input pl-12 pr-4 py-3.5 text-base bg-background/50 focus:outline-none focus:border-primary transition-colors"
              placeholder="Search any medicine (e.g., Aspirin, Metformin, Atorvastatin)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            className="w-full gradient-search text-primary-foreground font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            🔍 Search Medicine
          </button>

          {searched && results.length > 0 && (
            <div className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground font-semibold">{results.length} result{results.length > 1 ? 's' : ''} found</p>
              {results.map((med, idx) => renderMedicineCard(med, idx))}
            </div>
          )}

          {searched && results.length === 0 && (
            <div className="bg-accent/10 rounded-xl p-5 mt-4 text-center">
              <div className="text-4xl mb-2">🤔</div>
              <p className="text-foreground font-semibold">Medicine not found in our database.</p>
              <p className="text-muted-foreground text-sm mt-1">Try a different name or browse categories below.</p>
            </div>
          )}
        </div>
      </div>

      {/* Browse by category */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="gradient-blue-purple px-6 py-4 text-primary-foreground font-bold text-lg">
          📂 Browse by Category
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setShowCategory(showCategory === cat ? null : cat); setSearched(false); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  showCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {showCategory && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {getMedicinesByCategory(showCategory).map((med, idx) => renderMedicineCard(med, idx + 1000))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <p className="text-xs font-bold text-foreground mb-1">{label}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
    </div>
  );
}
