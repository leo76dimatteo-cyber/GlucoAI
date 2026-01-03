
import React, { useState, useEffect } from 'react';
import { GlucoseLog, MealType, InsulinType, MealItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { estimateMealCarbs } from '../services/geminiService';

interface LogEntryFormProps {
  onAddLog: (log: Omit<GlucoseLog, 'id'>) => void;
  onUpdateLog?: (log: GlucoseLog) => void;
  onClose: () => void;
  editingLog?: GlucoseLog | null;
}

const LogEntryForm: React.FC<LogEntryFormProps> = ({ onAddLog, onUpdateLog, onClose, editingLog }) => {
  const { t, language } = useLanguage();
  
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [sensorLevel, setSensorLevel] = useState<string>('');
  const [stickLevel, setStickLevel] = useState<string>('');
  const [insulinUnits, setInsulinUnits] = useState<string>('');
  const [insulinType, setInsulinType] = useState<InsulinType>(InsulinType.RAPID);
  const [mealType, setMealType] = useState<MealType>(MealType.CONTROL);
  const [notes, setNotes] = useState<string>('');

  const [showCarbCalc, setShowCarbCalc] = useState(false);
  const [mealDesc, setMealDesc] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedItems, setEstimatedItems] = useState<MealItem[]>([]);

  useEffect(() => {
    if (editingLog) {
      const dt = new Date(editingLog.timestamp);
      setDate(dt.toISOString().split('T')[0]);
      setTime(dt.toTimeString().split(' ')[0].substring(0, 5));
      setSensorLevel(editingLog.sensorLevel?.toString() || '');
      setStickLevel(editingLog.stickLevel?.toString() || '');
      setInsulinUnits(editingLog.insulinUnits?.toString() || '');
      setInsulinType(editingLog.insulinType);
      setMealType(editingLog.mealType);
      setNotes(editingLog.notes);
    } else {
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().split(' ')[0].substring(0, 5));
    }
  }, [editingLog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date(`${date}T${time}`).toISOString();
    const logData = {
      timestamp,
      sensorLevel: sensorLevel ? Number(sensorLevel) : undefined,
      stickLevel: stickLevel ? Number(stickLevel) : undefined,
      carbs: editingLog?.carbs || 0,
      insulinUnits: Number(insulinUnits) || 0,
      insulinType,
      mealType,
      notes
    };
    if (editingLog && onUpdateLog) {
      onUpdateLog({ ...logData, id: editingLog.id });
    } else {
      onAddLog(logData);
    }
    onClose();
  };

  const handleEstimateCarbs = async () => {
    if (!mealDesc.trim()) return;
    setIsEstimating(true);
    const items = await estimateMealCarbs(mealDesc, language);
    setEstimatedItems(items);
    setIsEstimating(false);
  };

  const confirmCarbCalc = () => {
    const total = estimatedItems.reduce((acc, item) => acc + item.carbs, 0);
    const detailString = estimatedItems.map(i => `${i.name}: ${i.carbs}g`).join(', ');
    const carbInfo = `\n[Carbs: ${total}g - ${detailString}]`;
    setNotes(prev => prev + carbInfo);
    setShowCarbCalc(false);
  };

  const inputClasses = "w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-white border-2 border-black focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(79,70,229,1)] transition-all font-black text-black caret-black text-xs md:text-md placeholder:text-slate-200";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[600] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 border-x-[3px] border-t-[3px] sm:border-[4px] border-black overflow-hidden max-h-[92vh] flex flex-col pb-[env(safe-area-inset-bottom,0px)]">
        
        {!showCarbCalc ? (
          <>
            <header className="p-5 md:p-8 border-b-2 md:border-b-4 border-black flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="space-y-0.5">
                <h2 className="text-lg md:text-2xl font-black text-black uppercase tracking-tighter leading-none">{editingLog ? t('edit_entry') : t('new_entry')}</h2>
                <p className="text-[7px] font-black text-indigo-500 uppercase tracking-widest italic">Biometrics Log</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center border-2 border-black rounded-xl hover:bg-slate-50 font-black transition-all">✕</button>
            </header>
            
            <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5 md:space-y-6 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('date')}</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClasses} />
                </div>
                <div className="space-y-1">
                  <label className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('time')}</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputClasses} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sensore (mg/dL)</label>
                  <input type="number" value={sensorLevel} onChange={(e) => setSensorLevel(e.target.value)} className={inputClasses} placeholder="---" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stick (mg/dL)</label>
                  <input type="number" value={stickLevel} onChange={(e) => setStickLevel(e.target.value)} className={inputClasses} placeholder="---" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Insulina (UI)</label>
                  <input type="number" step="0.5" value={insulinUnits} onChange={(e) => setInsulinUnits(e.target.value)} className={inputClasses} placeholder="0.0" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('meal_type')}</label>
                  <div className="relative">
                    <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className={inputClasses + " appearance-none"}>
                      {Object.values(MealType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 font-black">↓</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo Insulina</label>
                <div className="flex gap-2">
                   {[InsulinType.RAPID, InsulinType.LONG].map(type => (
                     <button
                       key={type} type="button" onClick={() => setInsulinType(type)}
                       className={`flex-1 py-3 md:py-4 rounded-xl border-2 font-black uppercase text-[8px] md:text-[9px] tracking-widest transition-all ${insulinType === type ? 'bg-indigo-600 border-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-black text-black hover:bg-slate-50'}`}
                     >
                       {type === InsulinType.RAPID ? 'Rapida' : 'Lenta'}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-2 pb-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('notes')}</label>
                  <button type="button" onClick={() => setShowCarbCalc(true)} className="text-indigo-600 text-[7px] font-black uppercase tracking-widest border-2 border-black px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                    ✨ IA Carbs
                  </button>
                </div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClasses} h-20 md:h-28 text-[9px] md:text-xs font-bold leading-relaxed resize-none`} placeholder="Note, carboidrati o context..." />
              </div>

              <button type="submit" className="w-full bg-black text-white font-black uppercase tracking-widest text-[9px] md:text-xs py-4 md:py-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:bg-slate-800 transition-all border-2 border-black active:translate-y-0.5">
                {t('save_entry')}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-200 h-full flex flex-col">
            <header className="p-5 md:p-8 border-b-2 md:border-b-4 border-black flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg md:text-2xl font-black text-black uppercase tracking-tighter leading-none">{t('smart_carb')}</h2>
              <button onClick={() => setShowCarbCalc(false)} className="w-10 h-10 flex items-center justify-center border-2 border-black rounded-xl hover:bg-slate-50 transition-all">✕</button>
            </header>
            <div className="p-5 md:p-8 space-y-6 overflow-y-auto no-scrollbar">
              <div className="space-y-2">
                <label className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('describe_meal')}</label>
                <div className="flex flex-col gap-2">
                  <input type="text" value={mealDesc} onChange={(e) => setMealDesc(e.target.value)} className={inputClasses} placeholder="Es: Pizza margherita intera" />
                  <button onClick={handleEstimateCarbs} disabled={isEstimating || !mealDesc.trim()} className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest disabled:opacity-30 transition-all border-2 border-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5">
                    {isEstimating ? <span className="animate-pulse">Analisi Nutrizionale...</span> : 'Esegui Stima'}
                  </button>
                </div>
              </div>

              {estimatedItems.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="border-[3px] border-black rounded-2xl overflow-hidden bg-slate-50">
                    <table className="w-full text-left">
                      <thead className="bg-black text-white text-[7px] font-black uppercase tracking-widest">
                        <tr>
                          <th className="px-4 py-2">Alimento</th>
                          <th className="px-4 py-2 text-right">Cho</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black/5 bg-white">
                        {estimatedItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 font-black text-black text-[9px]">
                              {item.name} 
                              <span className="text-[6px] text-slate-400 font-black block uppercase">{item.portion}</span>
                            </td>
                            <td className="px-4 py-2 text-right font-black text-black text-[10px]">{item.carbs}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-emerald-400 p-5 rounded-2xl flex justify-between items-baseline text-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="font-black uppercase text-[8px] tracking-widest">Totale Carboidrati</span>
                    <span className="text-3xl font-black tracking-tighter">{estimatedItems.reduce((acc, item) => acc + item.carbs, 0)}<span className="text-xs ml-1 uppercase opacity-60">g</span></span>
                  </div>

                  <button onClick={confirmCarbCalc} className="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-800 transition-all border-2 border-black shadow-lg">
                    {t('confirm_carbs')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogEntryForm;
