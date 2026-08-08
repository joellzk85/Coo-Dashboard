import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Cloud, CloudCheck, CloudLightning, RefreshCw, Smartphone, Key, UserCheck, ShieldCheck } from 'lucide-react';
import { AuthSyncModal } from './Modals/AuthSyncModal';

export const CloudSyncPill: React.FC = () => {
  const { user, syncStatus } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusDisplay = () => {
    if (syncStatus === 'syncing') {
      return {
        icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
        text: 'Syncing Cloud...',
        bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dot: 'bg-amber-400 animate-ping',
      };
    }
    if (syncStatus === 'error') {
      return {
        icon: <CloudLightning className="w-3.5 h-3.5 text-rose-500" />,
        text: 'Sync Error',
        bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dot: 'bg-rose-500',
      };
    }
    return {
      icon: <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />,
      text: user?.email ? 'Cloud Synced' : 'Cross-Device Sync',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      dot: 'bg-emerald-500',
    };
  };

  const status = getStatusDisplay();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer ${status.bg}`}
        title="Click to manage Cross-Device Cloud Sync & Account"
      >
        <div className="relative flex items-center justify-center">
          {status.icon}
          <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${status.dot}`} />
        </div>

        <div className="flex items-center gap-1.5">
          <span>{status.text}</span>
          <span className="text-[10px] opacity-60 font-mono bg-black/5 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
            {user?.isAnonymous
              ? 'Guest Mode'
              : user?.email
              ? user.email.split('@')[0]
              : 'PC & Mobile'}
          </span>
        </div>

        <Smartphone className="w-3 h-3 text-slate-400 ml-0.5" />
      </button>

      {isModalOpen && <AuthSyncModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};
