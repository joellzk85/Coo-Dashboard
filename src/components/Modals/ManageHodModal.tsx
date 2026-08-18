import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Department, CompanyId } from '../../types/dashboard';
import {
  X,
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Calendar,
  Zap,
  Briefcase
} from 'lucide-react';

interface ManageHodModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCompany?: CompanyId;
}

export const ManageHodModal: React.FC<ManageHodModalProps> = ({
  isOpen,
  onClose,
  initialCompany = 'next_energy',
}) => {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useDashboard();

  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  // Form states for adding / editing HOD
  const [companyId, setCompanyId] = useState<CompanyId>(initialCompany);
  const [deptName, setDeptName] = useState('');
  const [hodName, setHodName] = useState('');
  const [ahodName, setAhodName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [cadenceRequired, setCadenceRequired] = useState<'weekly' | 'monthly'>('weekly');
  const [filterCompany, setFilterCompany] = useState<CompanyId | 'all'>('all');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (dept: Department) => {
    setEditingDeptId(dept.id);
    setCompanyId(dept.companyId);
    setDeptName(dept.name);
    setHodName(dept.hod);
    setAhodName(dept.ahod || '');
    setRoleTitle(dept.roleTitle);
    setCadenceRequired(dept.cadenceRequired);
    setActiveTab('add');
  };

  const handleResetForm = () => {
    setEditingDeptId(null);
    setDeptName('');
    setHodName('');
    setAhodName('');
    setRoleTitle('');
    setCadenceRequired('weekly');
    setSaveSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !hodName.trim()) return;

    const generatedRoleTitle = roleTitle.trim() || `HOD - ${deptName.trim()}${ahodName.trim() ? ` (AHOD: ${ahodName.trim()})` : ''}`;

    if (editingDeptId) {
      await updateDepartment(editingDeptId, {
        companyId,
        name: deptName.trim(),
        hod: hodName.trim(),
        ahod: ahodName.trim() || undefined,
        roleTitle: generatedRoleTitle,
        cadenceRequired,
      });
      setSaveSuccessMessage(`Updated ${hodName.trim()} successfully!`);
    } else {
      await addDepartment({
        companyId,
        name: deptName.trim(),
        hod: hodName.trim(),
        ahod: ahodName.trim() || undefined,
        roleTitle: generatedRoleTitle,
        cadenceRequired,
      });
      setSaveSuccessMessage(`Added ${hodName.trim()} (${deptName.trim()}) to 1-on-1 tracking engine!`);
    }

    setTimeout(() => {
      handleResetForm();
      setActiveTab('list');
    }, 900);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the 121 tracking roster?`)) {
      await deleteDepartment(id);
    }
  };

  const filteredList = departments.filter(
    (d) => filterCompany === 'all' || d.companyId === filterCompany
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {editingDeptId ? 'Edit HOD / Leader Profile' : 'Add & Manage HODs for 1-on-1 Tracker'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure department heads, leadership roles, and 121 meeting cadences for Next Energy & Next Academy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Add HOD vs View Roster */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'list' && editingDeptId) handleResetForm();
              setActiveTab('add');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{editingDeptId ? 'Edit HOD' : 'Add New HOD'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>View All HODs Roster ({departments.length})</span>
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* TAB 1: ADD / EDIT HOD FORM */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700 font-medium">
            
            {/* 1. Company Selection */}
            <div>
              <label className="font-bold text-slate-900 block mb-1.5">
                Assign to Company
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCompanyId('next_energy')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    companyId === 'next_energy'
                      ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-blue-700">
                    <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                    <span>Next Energy</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Solar C&I EPC & Ops</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanyId('next_academy')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    companyId === 'next_academy'
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Next Academy</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Renewable Training</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanyId('group')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    companyId === 'group'
                      ? 'bg-amber-50/80 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Group Exec</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Executive Leadership</span>
                </button>
              </div>
            </div>

            {/* 2. Department Name & HOD Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Department / Unit Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Finance, Supply Chain, CS, Sales"
                  required
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Head of Department (HOD) Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={hodName}
                  onChange={(e) => setHodName(e.target.value)}
                  placeholder="e.g. Kenneth, Sarah Tan, Dr. Alif"
                  required
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white text-xs"
                />
              </div>
            </div>

            {/* 3. Assistant HOD & Role Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Assistant HOD (AHOD) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={ahodName}
                  onChange={(e) => setAhodName(e.target.value)}
                  placeholder="e.g. Alvin, Raymond"
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Official Role Title
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder={deptName ? `HOD - ${deptName}` : 'e.g. HOD - Sales, VP Operations'}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white text-xs"
                />
              </div>
            </div>

            {/* 4. Cadence Required */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Required 1-on-1 Meeting Cadence
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    cadenceRequired === 'weekly'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="cadence"
                    value="weekly"
                    checked={cadenceRequired === 'weekly'}
                    onChange={() => setCadenceRequired('weekly')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5 text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Weekly Cadence</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      4 sessions per month target (Standard for HODs)
                    </p>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    cadenceRequired === 'monthly'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="cadence"
                    value="monthly"
                    checked={cadenceRequired === 'monthly'}
                    onChange={() => setCadenceRequired('monthly')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5 text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Monthly Cadence</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      1 session per month target (Executive bosses / Specialists)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              {editingDeptId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{editingDeptId ? 'Save Changes' : 'Add HOD to 121'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: VIEW ALL HODS ROSTER */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-2">
              <div className="text-xs font-bold text-slate-700">
                Filter by Organization:
              </div>
              <div className="flex items-center gap-1">
                {(['all', 'next_energy', 'next_academy', 'group'] as const).map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => setFilterCompany(comp)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      filterCompany === comp
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {comp === 'all'
                      ? 'All'
                      : comp === 'next_energy'
                      ? 'Next Energy'
                      : comp === 'next_academy'
                      ? 'Next Academy'
                      : 'Group'}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {filteredList.map((dept) => {
                const isEnergy = dept.companyId === 'next_energy';
                const isAcademy = dept.companyId === 'next_academy';

                return (
                  <div
                    key={dept.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white ${
                          isEnergy
                            ? 'bg-blue-600'
                            : isAcademy
                            ? 'bg-emerald-600'
                            : 'bg-amber-600'
                        }`}
                      >
                        {dept.hod.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{dept.hod}</span>
                          {dept.ahod && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              (AHOD: {dept.ahod})
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              isEnergy
                                ? 'bg-blue-100 text-blue-800'
                                : isAcademy
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {dept.companyId === 'next_energy'
                              ? 'Next Energy'
                              : dept.companyId === 'next_academy'
                              ? 'Next Academy'
                              : 'Group'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Dept: <strong className="text-slate-700">{dept.name}</strong> • Role: {dept.roleTitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                          dept.cadenceRequired === 'weekly'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {dept.cadenceRequired} (
                        {dept.cadenceRequired === 'weekly' ? '4/mo' : '1/mo'})
                      </span>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(dept)}
                        title="Edit HOD"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(dept.id, dept.hod)}
                        title="Delete HOD"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
