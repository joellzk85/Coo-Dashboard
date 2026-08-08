import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { CompanyGoal, DepartmentGoal, Milestone } from '../../types/dashboard';
import { X, Plus, Trash2, CheckCircle2, Circle, AlertTriangle, Save } from 'lucide-react';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit: { type: 'company' | 'department'; data: CompanyGoal | DepartmentGoal } | null;
}

export const EditGoalModal: React.FC<EditGoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const {
    updateCompanyGoal,
    deleteCompanyGoal,
    updateDepartmentGoal,
    deleteDepartmentGoal,
    departments
  } = useDashboard();

  const [formData, setFormData] = useState<any>({});
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setFormData({ ...goalToEdit.data });
      setMilestones([...(goalToEdit.data.milestones || [])]);
    }
  }, [goalToEdit]);

  if (!isOpen || !goalToEdit) return null;

  const isCompany = goalToEdit.type === 'company';

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const newMs: Milestone = {
      id: `ms_${Date.now()}`,
      title: newMilestoneTitle.trim(),
      completed: false,
    };
    setMilestones([...milestones, newMs]);
    setNewMilestoneTitle('');
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompany) {
      updateCompanyGoal(formData.id, {
        title: formData.title,
        description: formData.description,
        targetMetric: formData.targetMetric,
        currentValue: Number(formData.currentValue),
        targetValue: Number(formData.targetValue),
        unit: formData.unit,
        targetDate: formData.targetDate,
        overallRating: formData.overallRating,
        milestones,
      });
    } else {
      updateDepartmentGoal(formData.id, {
        title: formData.title,
        description: formData.description,
        departmentId: formData.departmentId,
        departmentName: formData.departmentName,
        hodName: formData.hodName,
        targetMetric: formData.targetMetric,
        progressPercent: Number(formData.progressPercent),
        status: formData.status,
        targetDate: formData.targetDate,
        milestones,
      });
    }
    onClose();
  };

  const handleDeleteGoal = () => {
    if (window.confirm(`Are you sure you want to delete this ${isCompany ? 'Company Goal' : 'Department Goal'}?`)) {
      if (isCompany) {
        deleteCompanyGoal(formData.id);
      } else {
        deleteDepartmentGoal(formData.id);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              {isCompany ? 'Company Big Goal Editor' : 'Department Goal Editor'}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Edit Goal & Milestones</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Strategic Intent</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Specific Fields depending on Goal Type */}
          {isCompany ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Metric</label>
                <input
                  type="text"
                  value={formData.targetMetric || ''}
                  onChange={e => setFormData({ ...formData, targetMetric: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Value</label>
                <input
                  type="number"
                  step="any"
                  value={formData.currentValue ?? 0}
                  onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Value ({formData.unit || 'Units'})</label>
                <input
                  type="number"
                  step="any"
                  value={formData.targetValue ?? 0}
                  onChange={e => setFormData({ ...formData, targetValue: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progressPercent ?? 0}
                  onChange={e => setFormData({ ...formData, progressPercent: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status || 'On Track'}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Behind">Behind</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate || ''}
                  onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Milestones Section */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Key Milestones & Deliverables</h4>
              <span className="text-xs text-slate-400 font-medium">{milestones.filter(m => m.completed).length} / {milestones.length} Completed</span>
            </div>

            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleToggleMilestone(m.id)}
                    className="flex items-center gap-2 text-left text-xs font-medium text-slate-200 flex-1 hover:text-white"
                  >
                    {m.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className={m.completed ? 'line-through text-slate-500' : ''}>{m.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(m.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {milestones.length === 0 && (
                <div className="text-xs text-slate-500 italic text-center py-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  No milestones added yet. Add key quarterly deliverables below.
                </div>
              )}
            </div>

            {/* Add Milestone Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new milestone..."
                value={newMilestoneTitle}
                onChange={e => setNewMilestoneTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMilestone(); } }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDeleteGoal}
              className="bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Goal</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
