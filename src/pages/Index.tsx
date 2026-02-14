import { useState } from 'react';
import { Bell, Search, AlertTriangle, Calendar, Sparkles } from 'lucide-react';
import { getGreeting } from '@/lib/medmind-data';
import RemindersTab from '@/components/RemindersTab';
import MedicineInfoTab from '@/components/MedicineInfoTab';
import SymptomCheckerTab from '@/components/SymptomCheckerTab';
import DailySummaryTab from '@/components/DailySummaryTab';
import bgPattern from '@/assets/bg-pattern.jpg';

const TABS = [
  { id: 'reminders', label: 'Reminders', icon: <Bell size={18} />, emoji: '🔔' },
  { id: 'medicine-info', label: 'Medicine Info', icon: <Search size={18} />, emoji: '🔎' },
  { id: 'symptom-checker', label: 'Symptom Checker', icon: <AlertTriangle size={18} />, emoji: '⚠️' },
  { id: 'daily-summary', label: 'Daily Summary', icon: <Calendar size={18} />, emoji: '📅' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('reminders');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgPattern})` }}
      />
      <div className="fixed inset-0 bg-background/40 backdrop-blur-sm" />

      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 text-5xl opacity-20 animate-float pointer-events-none">💊</div>
      <div className="fixed top-40 right-20 text-4xl opacity-15 animate-float-slow pointer-events-none" style={{ animationDelay: '2s' }}>💗</div>
      <div className="fixed bottom-32 left-1/4 text-3xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: '4s' }}>🩺</div>
      <div className="fixed bottom-20 right-10 text-4xl opacity-15 animate-float-slow pointer-events-none" style={{ animationDelay: '1s' }}>🌿</div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 gradient-blue-purple rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
            <span className="text-3xl">💊</span>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary flex items-center gap-2">
              MedMind+
              <Sparkles className="text-accent" size={24} />
            </h1>
            <p className="text-muted-foreground text-base">{getGreeting()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card rounded-2xl p-1.5 mb-8 flex justify-center overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'gradient-primary text-primary-foreground shadow-lg scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'reminders' && <RemindersTab />}
          {activeTab === 'medicine-info' && <MedicineInfoTab />}
          {activeTab === 'symptom-checker' && <SymptomCheckerTab />}
          {activeTab === 'daily-summary' && <DailySummaryTab />}
        </div>
      </div>
    </div>
  );
};

export default Index;
