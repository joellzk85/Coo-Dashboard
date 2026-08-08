import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { WellnessLog } from '../types/dashboard';
import {
  HeartPulse,
  Utensils,
  Activity,
  Plus,
  Droplet,
  Flame,
  Zap,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Footprints,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface DashboardWellnessProps {
  onOpenAddWellness?: () => void;
}

export const DashboardWellness: React.FC<DashboardWellnessProps> = () => {
  const { wellnessLogs, addWellnessLog, deleteWellnessLog } = useDashboard();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>('');

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [snacks, setSnacks] = useState('');
  const [waterLiters, setWaterLiters] = useState('3.0');
  const [caloriesEst, setCaloriesEst] = useState('2200');
  const [foodNotes, setFoodNotes] = useState('');

  const [activityType, setActivityType] = useState('Zone 2 Running');
  const [durationMins, setDurationMins] = useState('45');
  const [intensity, setIntensity] = useState<'Light' | 'Moderate' | 'Vigorous' | 'Peak'>('Vigorous');
  const [steps, setSteps] = useState('10000');
  const [caloriesBurned, setCaloriesBurned] = useState('500');
  const [movementNotes, setMovementNotes] = useState('');
  const [energyRating, setEnergyRating] = useState('5');

  // Computed summary metrics
  const totalEntries = wellnessLogs.length;
  const avgMovementMins = totalEntries > 0
    ? Math.round(wellnessLogs.reduce((acc, l) => acc + l.movement.durationMinutes, 0) / totalEntries)
    : 0;
  const avgWater = totalEntries > 0
    ? (wellnessLogs.reduce((acc, l) => acc + l.foodIntake.waterIntakeLiters, 0) / totalEntries).toFixed(1)
    : '0';
  const avgEnergy = totalEntries > 0
    ? (wellnessLogs.reduce((acc, l) => acc + l.energyRating, 0) / totalEntries).toFixed(1)
    : '0';

  const filteredLogs = filterMonth
    ? wellnessLogs.filter(l => l.date.startsWith(filterMonth))
    : wellnessLogs;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWellnessLog({
      date,
      foodIntake: {
        breakfast,
        lunch,
        dinner,
        snacks,
        waterIntakeLiters: parseFloat(waterLiters) || 0,
        caloriesEstimate: parseInt(caloriesEst, 10) || undefined,
        notes: foodNotes,
      },
      movement: {
        activityType,
        durationMinutes: parseInt(durationMins, 10) || 0,
        intensity,
        stepsCount: parseInt(steps, 10) || undefined,
        caloriesBurned: parseInt(caloriesBurned, 10) || undefined,
        notes: movementNotes,
      },
      energyRating: parseInt(energyRating, 10) || 5,
    });

    setIsModalOpen(false);
    // Reset form
    setBreakfast('');
    setLunch('');
    setDinner('');
    setSnacks('');
    setFoodNotes('');
    setMovementNotes('');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-widest">
              Executive Vitality & Mastery
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 tracking-tight flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-rose-500" />
            <span>Personal Wellness & Movement Tracker</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Track daily food nutrition intake, workout intensity, hydration, and stamina metrics to sustain high-level executive decision endurance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 self-start md:self-auto shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Today's Wellness</span>
        </button>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Daily Movement</span>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{avgMovementMins}</span>
            <span className="text-xs text-slate-500 font-semibold">mins / day</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Target: 45+ mins Zone 2
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hydration Index</span>
            <Droplet className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{avgWater}</span>
            <span className="text-xs text-slate-500 font-semibold">Liters / day</span>
          </div>
          <div className="text-[11px] text-cyan-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-cyan-600" /> Optimal Brain Focus
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Executive Energy</span>
            <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{avgEnergy}</span>
            <span className="text-xs text-slate-500 font-semibold">/ 5.0 Rating</span>
          </div>
          <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> High Stamina Peak
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Days Logged</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{totalEntries}</span>
            <span className="text-xs text-slate-500 font-semibold">entries</span>
          </div>
          <div className="text-[11px] text-purple-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-purple-600" /> Feeds Automated KPI Grade
          </div>
        </div>
      </div>

      {/* Logs Table / Card Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-blue-600" />
            <span>Daily Food & Movement Logs</span>
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="bg-white border border-slate-200 text-xs px-2.5 py-1 rounded-lg text-slate-700 font-medium focus:outline-none"
            />
            {filterMonth && (
              <button
                onClick={() => setFilterMonth('')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-300 transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{log.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <span className="font-semibold text-slate-400">Energy Level:</span>
                    <span className="font-extrabold text-amber-600 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {log.energyRating} / 5
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Delete this wellness log?')) deleteWellnessLog(log.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors self-end sm:self-auto"
                  title="Delete log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Grid: Food Intake vs Movement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Food Intake Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <Utensils className="w-4 h-4 text-blue-600" /> Daily Food Intake
                    </span>
                    <span className="text-slate-500 font-medium">~{log.foodIntake.caloriesEstimate || 2000} kcal</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div>
                      <span className="font-bold text-slate-900">Breakfast: </span>
                      <span className="text-slate-600">{log.foodIntake.breakfast || 'Not logged'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Lunch: </span>
                      <span className="text-slate-600">{log.foodIntake.lunch || 'Not logged'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Dinner: </span>
                      <span className="text-slate-600">{log.foodIntake.dinner || 'Not logged'}</span>
                    </div>
                    {log.foodIntake.snacks && (
                      <div>
                        <span className="font-bold text-slate-900">Snacks: </span>
                        <span className="text-slate-600">{log.foodIntake.snacks}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-200/80 text-slate-600 font-medium">
                    <span className="flex items-center gap-1 text-cyan-700 font-bold">
                      <Droplet className="w-3.5 h-3.5 text-cyan-600" /> {log.foodIntake.waterIntakeLiters} L Water
                    </span>
                    {log.foodIntake.notes && (
                      <span className="text-slate-500 italic truncate max-w-[200px]">"{log.foodIntake.notes}"</span>
                    )}
                  </div>
                </div>

                {/* Movement / Exercise Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Activity className="w-4 h-4 text-emerald-600" /> Daily Movement & Exercise
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      {log.movement.intensity} Intensity
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-sm">{log.movement.activityType}</div>
                    
                    <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Duration</div>
                        <div className="font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" /> {log.movement.durationMinutes}m
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Steps</div>
                        <div className="font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                          <Footprints className="w-3 h-3 text-slate-400" /> {log.movement.stepsCount || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Burned</div>
                        <div className="font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3 text-amber-500" /> {log.movement.caloriesBurned || '-'} kcal
                        </div>
                      </div>
                    </div>

                    {log.movement.notes && (
                      <div className="text-xs text-slate-600 italic pt-1">
                        "{log.movement.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
              <HeartPulse className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No wellness logs found for this period.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 text-xs text-blue-600 font-bold hover:underline"
              >
                + Add First Wellness Entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Wellness Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white">Log Daily Food & Movement</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs font-bold">Close</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Date & Energy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Log Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Executive Energy Score (1 - 5)</label>
                  <select
                    value={energyRating}
                    onChange={e => setEnergyRating(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="5">5 - Peak Vitality & Sharp Focus</option>
                    <option value="4">4 - High Energy & Productive</option>
                    <option value="3">3 - Moderate / Normal</option>
                    <option value="2">2 - Fatigue / Heavy Workload</option>
                    <option value="1">1 - Exhausted</option>
                  </select>
                </div>
              </div>

              {/* Food Intake Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" /> Food & Nutrition Intake
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Breakfast</label>
                    <input
                      type="text"
                      placeholder="e.g. Oatmeal, eggs, protein shake..."
                      value={breakfast}
                      onChange={e => setBreakfast(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Lunch</label>
                    <input
                      type="text"
                      placeholder="e.g. Grilled chicken bowl, quinoa..."
                      value={lunch}
                      onChange={e => setLunch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Dinner</label>
                    <input
                      type="text"
                      placeholder="e.g. Salmon, sweet potato, green vegetables..."
                      value={dinner}
                      onChange={e => setDinner(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Snacks</label>
                    <input
                      type="text"
                      placeholder="e.g. Almonds, Greek yogurt, green tea..."
                      value={snacks}
                      onChange={e => setSnacks(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Water Intake (Liters)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={waterLiters}
                      onChange={e => setWaterLiters(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Est. Total Calories (kcal)</label>
                    <input
                      type="number"
                      value={caloriesEst}
                      onChange={e => setCaloriesEst(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Movement Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Movement & Workout
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Activity Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Zone 2 Running, Weightlifting, Gym..."
                      value={activityType}
                      onChange={e => setActivityType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Intensity Level</label>
                    <select
                      value={intensity}
                      onChange={e => setIntensity(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    >
                      <option value="Light">Light (Active Recovery / Walk)</option>
                      <option value="Moderate">Moderate (Steady Aerobic)</option>
                      <option value="Vigorous">Vigorous (Zone 2 / Strength)</option>
                      <option value="Peak">Peak (HIIT / Hard Interval)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      value={durationMins}
                      onChange={e => setDurationMins(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Daily Steps</label>
                    <input
                      type="number"
                      value={steps}
                      onChange={e => setSteps(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Calories Burned</label>
                    <input
                      type="number"
                      value={caloriesBurned}
                      onChange={e => setCaloriesBurned(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Workout Notes / Physical Feeling</label>
                  <input
                    type="text"
                    placeholder="e.g. Strong cardio endurance, good recovery..."
                    value={movementNotes}
                    onChange={e => setMovementNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30"
                >
                  Save Daily Wellness Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
