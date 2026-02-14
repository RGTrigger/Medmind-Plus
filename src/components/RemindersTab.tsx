import { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import {
  getMedicines,
  addMedicine,
  deleteMedicine,
  logAction,
  getTodaySchedule,
  getLogs,
  type Medicine,
} from '@/lib/medmind-data';
import { toast } from 'sonner';

export default function RemindersTab() {
  const [medicines, setMedicines] = useState<Medicine[]>(getMedicines());
  const [schedule, setSchedule] = useState<Medicine[]>(getTodaySchedule());
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once Daily');
  const [time, setTime] = useState('');

  const refresh = () => {
    setMedicines(getMedicines());
    setSchedule(getTodaySchedule());
  };

  const handleAdd = () => {
    if (!name.trim() || !dosage.trim() || !time) {
      toast.error('Please fill in all fields');
      return;
    }
    addMedicine({ name: name.trim(), dosage: dosage.trim(), frequency, time });
    setName(''); setDosage(''); setTime(''); setFrequency('Once Daily');
    toast.success('Medicine added!');
    refresh();
  };

  const handleAction = (id: string, action: 'taken' | 'missed') => {
    logAction(id, action);
    toast.success(action === 'taken' ? '✅ Marked as taken!' : '❌ Marked as missed');
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteMedicine(id);
    toast.success('Medicine deleted');
    refresh();
  };

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = getLogs().filter(l => l.timestamp.startsWith(today));
  const loggedIds = new Set(todayLogs.map(l => l.medicineId));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Medicine */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="gradient-blue-purple px-6 py-4 text-primary-foreground font-bold text-lg flex items-center gap-2">
            <Plus size={20} /> ✨ Add New Medicine
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Medicine Name</label>
              <input
                className="w-full rounded-lg border-2 border-input px-4 py-3 text-base bg-background focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g., Paracetamol"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Dosage</label>
              <input
                className="w-full rounded-lg border-2 border-input px-4 py-3 text-base bg-background focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g., 500mg"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Frequency</label>
              <select
                className="w-full rounded-lg border-2 border-input px-4 py-3 text-base bg-background focus:outline-none focus:border-primary transition-colors"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
              >
                <option>Once Daily</option>
                <option>Twice Daily</option>
                <option>Three Times Daily</option>
                <option>Every 4 Hours</option>
                <option>Every 6 Hours</option>
                <option>As Needed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Time</label>
              <input
                type="time"
                className="w-full rounded-lg border-2 border-input px-4 py-3 text-base bg-background focus:outline-none focus:border-primary transition-colors"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full gradient-blue-purple text-primary-foreground font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-all hover:shadow-lg active:scale-[0.98]"
            >
              ✨ Add Medicine
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="gradient-green px-6 py-4 text-primary-foreground font-bold text-lg flex items-center gap-2">
            <Clock size={20} /> 🕐 Today's Schedule
          </div>
          <div className="p-6 min-h-[200px] flex items-center justify-center">
            {schedule.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <div className="text-5xl mb-3">💊</div>
                <p className="text-lg">No medicines scheduled yet</p>
              </div>
            ) : (
              <div className="w-full space-y-3">
                {schedule.map(med => (
                  <div key={med.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div>
                      <p className="font-bold text-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage} • {med.time}</p>
                    </div>
                    <span className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Your Medicines */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="gradient-orange px-6 py-4 text-primary-foreground font-bold text-lg flex items-center gap-2">
          💊 Your Medicines
        </div>
        <div className="p-6">
          {medicines.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-lg">No medicines added yet. Add your first medicine above!</p>
          ) : (
            <div className="space-y-3">
              {medicines.map(med => {
                const isLogged = loggedIds.has(med.id);
                return (
                  <div key={med.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-2 border-border rounded-xl gap-3">
                    <div>
                      <p className="font-bold text-lg text-foreground">{med.name}</p>
                      <p className="text-muted-foreground">{med.dosage} • {med.frequency} • {med.time}</p>
                    </div>
                    {!isLogged ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleAction(med.id, 'taken')} className="gradient-green text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
                          ✅ Taken
                        </button>
                        <button onClick={() => handleAction(med.id, 'missed')} className="gradient-red text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
                          ❌ Missed
                        </button>
                        <button onClick={() => handleDelete(med.id)} className="bg-muted text-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-80 transition-all">
                          🗑️ Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Already logged today</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
