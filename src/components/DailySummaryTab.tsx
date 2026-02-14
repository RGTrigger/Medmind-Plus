import { useState } from 'react';
import { Download, Calendar, CheckCircle, Clock, XCircle, Pill, Lightbulb } from 'lucide-react';
import {
  getDailySummary,
  getTodaySchedule,
  getMissedDoses,
  getMedicines,
  downloadReport,
} from '@/lib/medmind-data';
import { getAdherenceInsights } from '@/lib/history-intelligence';

export default function DailySummaryTab() {
  const [summary] = useState(getDailySummary());
  const [schedule] = useState(getTodaySchedule());
  const [missed] = useState(getMissedDoses());
  const medicines = getMedicines();

  const stats = [
    { label: 'Total Medicines', value: summary.total, icon: <Pill size={28} />, className: 'gradient-primary' },
    { label: 'Taken Today', value: summary.taken, icon: <CheckCircle size={28} />, className: 'gradient-green' },
    { label: 'Upcoming', value: summary.pending, icon: <Clock size={28} />, className: 'gradient-orange' },
    { label: 'Missed', value: summary.missed, icon: <XCircle size={28} />, className: 'gradient-red' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.className} rounded-2xl p-6 text-primary-foreground text-center shadow-stat relative overflow-hidden`}>
            <div className="text-4xl font-extrabold mb-1">{s.value}</div>
            <div className="text-sm font-semibold opacity-90">{s.label}</div>
            <div className="absolute bottom-2 right-3 opacity-30">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Upcoming & Missed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="gradient-primary px-6 py-4 text-primary-foreground font-bold text-lg flex items-center gap-2">
            <Clock size={20} /> 🕐 Upcoming Reminders
          </div>
          <div className="p-6 min-h-[150px] flex items-center justify-center">
            {schedule.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">📅</div>
                <p>No upcoming reminders</p>
              </div>
            ) : (
              <div className="w-full space-y-3">
                {schedule.map(med => (
                  <div key={med.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div>
                      <p className="font-bold text-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage} • {med.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="gradient-orange px-6 py-4 text-primary-foreground font-bold text-lg flex items-center gap-2">
            <Calendar size={20} /> ⚠️ Missed Doses
          </div>
          <div className="p-6 min-h-[150px] flex items-center justify-center">
            {missed.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">✅</div>
                <p>Great job! No missed doses</p>
              </div>
            ) : (
              <div className="w-full space-y-3">
                {missed.map(log => {
                  const med = medicines.find(m => m.id === log.medicineId);
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-xl">
                      <div>
                        <p className="font-bold text-destructive">{med?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Report */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">📊 Medicine Report</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Download a comprehensive report of all your medicines, including when they were taken, missed, and upcoming schedules.
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="gradient-red text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all hover:shadow-lg flex-shrink-0"
          >
            <Download size={18} /> 📄 Download Report
          </button>
        </div>
      </div>

      {/* Personalized Insights */}
      {(() => {
        const insights = getAdherenceInsights();
        if (insights.length === 0) return null;
        return (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="gradient-blue-purple px-6 py-4 text-primary-foreground font-bold text-lg flex items-center gap-2">
              <Lightbulb size={20} /> 💡 Personal Health Insights
            </div>
            <div className="p-6 space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <p className="font-bold text-foreground text-sm">{insight.title}</p>
                    <p className="text-muted-foreground text-sm mt-0.5">{insight.message}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">
                💡 Insights improve as you log more medicines. Keep tracking for better personalized recommendations!
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
