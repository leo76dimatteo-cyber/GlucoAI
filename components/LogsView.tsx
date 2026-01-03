
import React, { useState } from 'react';
import { GlucoseLog, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { GLUCOSE_THRESHOLDS } from '../constants';

interface LogsViewProps {
  logs: GlucoseLog[];
  onEdit: (log: GlucoseLog) => void;
  onDelete: (id: string) => void;
  onExportJson: () => void;
  onExportPdf: () => void;
}

const LogsView: React.FC<LogsViewProps> = ({ logs, onEdit, onDelete, onExportJson, onExportPdf }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('');

  const filteredLogs = logs.filter(l => 
    l.notes.toLowerCase().includes(filter.toLowerCase()) || 
    l.mealType.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-slate-100 pb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">History Hub</p>
          <h1 className="text-4xl md:text-7xl font-black text-black tracking-tighter uppercase leading-none">{t('journal_history')}</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={onExportJson}
            className="flex-1 md:flex-none bg-white border-2 border-black text-black px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            📦 JSON
          </button>
          <button 
            onClick={onExportPdf}
            className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          >
            📋 {t('generate_pdf')}
          </button>
        </div>
      </header>

      <div className="relative">
        <input 
          type="text"
          placeholder="Cerca nelle note o nel contesto..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-5 pl-14 bg-slate-50 border-2 border-black rounded-2xl font-bold placeholder:text-slate-300 focus:outline-none focus:bg-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.02)]"
        />
        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
      </div>

      <div className="bg-white border-[4px] border-black rounded-[2.5rem] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b-4 border-black">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">{t('date')}</th>
                <th className="px-8 py-6">Glicemia</th>
                <th className="px-8 py-6">{t('carbs_intake')}</th>
                <th className="px-8 py-6">{t('insulin_units')}</th>
                <th className="px-8 py-6">{t('notes')}</th>
                <th className="px-8 py-6 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/5">
              {filteredLogs.map((log) => {
                const val = log.sensorLevel || log.stickLevel || 0;
                const status = val > GLUCOSE_THRESHOLDS.HYPER ? 'hyper' : val < GLUCOSE_THRESHOLDS.HYPO ? 'hypo' : 'normal';
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-[11px] uppercase tracking-tight">{new Date(log.timestamp).toLocaleDateString()}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center justify-center min-w-[50px] h-10 px-3 rounded-lg border-2 border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${status === 'hyper' ? 'bg-amber-400' : status === 'hypo' ? 'bg-rose-500 text-white' : 'bg-emerald-400'}`}>
                        {val}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {log.carbs > 0 ? (
                        <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg border-2 border-amber-100 text-[10px] font-black uppercase">
                          {log.carbs}g CHO
                        </span>
                      ) : <span className="text-slate-200">-</span>}
                    </td>
                    <td className="px-8 py-6">
                      {log.insulinUnits > 0 ? (
                        <span className="bg-rose-50 text-rose-500 px-3 py-1.5 rounded-lg border-2 border-rose-100 text-[10px] font-black uppercase">
                          {log.insulinUnits}u {log.insulinType.split('-')[0]}
                        </span>
                      ) : <span className="text-slate-200">-</span>}
                    </td>
                    <td className="px-8 py-6 max-w-[200px]">
                      <p className="text-[9px] font-black uppercase text-indigo-500 mb-0.5">{log.mealType}</p>
                      <p className="text-[10px] font-medium text-slate-600 truncate">{log.notes || '---'}</p>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                       <button onClick={() => onEdit(log)} className="w-9 h-9 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all text-sm">✏️</button>
                       <button onClick={() => onDelete(log.id)} className="w-9 h-9 border-2 border-rose-600 rounded-lg text-rose-600 hover:bg-rose-600 hover:text-white transition-all text-sm">✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogsView;
