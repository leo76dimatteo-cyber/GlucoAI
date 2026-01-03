
import React from 'react';
import { GlucoseLog, DashboardStats, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import TrendChart from './TrendChart';

interface HealthReportProps {
  logs: GlucoseLog[];
  stats: DashboardStats;
  user: UserProfile;
  range: 'day' | 'week' | 'month';
  onClose: () => void;
}

const HealthReport: React.FC<HealthReportProps> = ({ logs, stats, user, range, onClose }) => {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-white z-[2000] overflow-y-auto p-4 md:p-12 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Controls Bar - Hidden on print */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-100 print:hidden">
          <button onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black">
            ← {t('cancel')}
          </button>
          <button 
            onClick={handlePrint} 
            className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]"
          >
            🖨️ {t('print_plan')}
          </button>
        </div>

        {/* The Actual Report Content */}
        <div id="printable-report" className="bg-white p-10 border-[6px] border-black rounded-[2.5rem] print:border-none print:p-0">
          <header className="flex justify-between items-start mb-12 pb-8 border-b-4 border-black">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-4xl font-black rotate-3 shrink-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">G</div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">GlucoAI Report</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mt-2">{t('health_report_title')}</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest">{user.name}</p>
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">CF: {user.id}</p>
              <p className="text-[8px] font-black uppercase text-indigo-500 tracking-widest mt-4">
                {t('period')}: {range.toUpperCase()}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-4 gap-6 mb-12">
            <ReportStat label={t('avg_glucose')} value={`${stats.averageLevel}`} unit="mg/dL" />
            <ReportStat label={t('time_in_range')} value={`${stats.timeInRange}%`} unit="TIR" />
            <ReportStat label={t('hypo_events')} value={`${stats.hypoCount}`} unit="Events" />
            <ReportStat label={t('hyper_events')} value={`${stats.hyperCount}`} unit="Events" />
          </div>

          <div className="mb-12 h-80 border-4 border-black p-6 rounded-[2rem] bg-slate-50">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('glucose_trends')}</p>
            <TrendChart logs={logs} range={range} />
          </div>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-l-4 border-indigo-600 pl-4">{t('journal_history')}</h3>
            <div className="border-[3px] border-black rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-black text-white text-[8px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3">Data/Ora</th>
                    <th className="px-4 py-3">Valore</th>
                    <th className="px-4 py-3">Insulina</th>
                    <th className="px-4 py-3">Carboidrati</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/5">
                  {logs.slice(0, 30).map((log) => (
                    <tr key={log.id} className="text-[9px] font-bold">
                      <td className="px-4 py-2 text-slate-400">
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-2 font-black">
                        {log.sensorLevel || log.stickLevel} mg/dL
                      </td>
                      <td className="px-4 py-2 text-rose-600">
                        {log.insulinUnits > 0 ? `${log.insulinUnits}u (${log.insulinType})` : '-'}
                      </td>
                      <td className="px-4 py-2 text-amber-600">
                        {log.carbs > 0 ? `${log.carbs}g` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between items-center text-[7px] font-black uppercase text-slate-300 tracking-widest">
            <p>© 2025 GLUCOAI CLINICAL INTELLIGENCE • AUTOMATED MEDICAL REPORT</p>
            <p>GENERATED ON {new Date().toLocaleDateString()}</p>
          </footer>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          #printable-report { 
            border: none !important; 
            box-shadow: none !important; 
            padding: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

const ReportStat: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-white border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
    <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="text-xl font-black text-black leading-none">{value}</p>
    <p className="text-[7px] font-black uppercase text-indigo-500 tracking-tighter">{unit}</p>
  </div>
);

export default HealthReport;
