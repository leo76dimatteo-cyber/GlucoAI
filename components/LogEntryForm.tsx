
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

  const inputClasses = "w-full p-3 md:p-5 rounded-xl md:rounded-2xl bg-white border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] transition-all font-black text-black caret-black text-sm md:text-md";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[600] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 border-x-4 border-t-4 sm:border-4 border-black overflow-hidden max-h-[90vh] flex flex-col">
        
        {!showCarbCalc ? (
          <>
            <header className="p-6 md:p-10 border-b-2 md:border-b-4 border-black flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl md:text-3xl font-black text-black uppercase tracking-tighter leading-none">{editingLog ? t('edit_entry') : t('new_entry')}</h2>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center border-2 border-black rounded-xl hover:bg-slate-50 font-black transition-all">✕</button>
            </header>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1">
                  <label className="block text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest ml-1">{t('date')}</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClasses} />
                </div>
                <div className="space-y-1">
                  <label className="block text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest ml-1">{t('time')}</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputClasses} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1">
                  <label className="block text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest ml-1">Sensore</label>
                  <input type="number" value={sensorLevel} onChange={(e) => setSensorLevel(e.target.value)} className={inputClasses} placeholder="---" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest ml-1">Stick</label>
                  <input type="number" value={stickLevel} onChange={(e) => setStickLevel(e.target.value)} className={inputClasses} placeholder="---" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1">
                  <label className="block text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest ml-1">Insulina (u)</label>
                  <input type="number" step="0.5" value={insulinUnits} onChange={(e) => setInsulinUnits(e.target.value)} className={inputClasses} placeholder="0.0" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest ml-1">{t('meal_type')}</label>
                  <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className={inputClasses + " appearance-none"}>
                    {Object.values(MealType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest ml-1">Tipo Insulina</label>
                <div className="flex gap-2">
                   {[InsulinType.RAPID, InsulinType.LONG].map(type => (
                     <button
                       key={type} type="button" onClick={() => setInsulinType(type)}
                       className={`flex-1 py-3 md:py-4 rounded-xl border-2 font-black uppercase text-[8px] md:text-[10px] tracking-widest transition-all ${insulinType === type ? 'bg-black border-black text-white' : 'bg-white border-black text-black hover:bg-slate-50'}`}
                     >
                       {type === InsulinType.RAPID ? 'Rapida' : 'Lenta'}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-3 pb-4">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest">{t('notes')}</label>
                  <button type="button" onClick={() => setShowCarbCalc(true)} className="text-black text-[8px] font-black uppercase tracking-widest border-2 border-black px-2 py-1 rounded-lg hover:bg-slate-50 transition-all">
                    ✨ IA Carbs
                  </button>
                </div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClasses} h-24 md:h-32 text-[10px] md:text-xs font-bold leading-relaxed resize-none`} placeholder="Note aggiuntive..." />
              </div>

              <button type="submit" className="w-full bg-black text-white font-black uppercase tracking-widest text-[10px] md:text-xs py-5 md:py-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:bg-slate-800 transition-all border-2 border-black">
                {t('save_entry')}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-200 h-full flex flex-col">
            <header className="p-6 md:p-10 border-b-2 md:border-b-4 border-black flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl md:text-3xl font-black text-black uppercase tracking-tighter leading-none">{t('smart_carb')}</h2>
              <button onClick={() => setShowCarbCalc(false)} className="w-10 h-10 flex items-center justify-center border-2 border-black rounded-xl hover:bg-slate-50 transition-all">✕</button>
            </header>
            <div className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto">
              <div className="space-y-3">
                <label className="block text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest ml-1">Cosa hai mangiato?</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" value={mealDesc} onChange={(e) => setMealDesc(e.target.value)} className={inputClasses} placeholder="Es: Pasta integrale al pomodoro" />
                  <button onClick={handleEstimateCarbs} disabled={isEstimating || !mealDesc.trim()} className="bg-black text-white px-6 py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest disabled:opacity-20 transition-all border-2 border-black flex items-center justify-center gap-2">
                    {isEstimating ? '...' : 'Calcola'}
                  </button>
                </div>
              </div>

              {estimatedItems.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="border-2 md:border-4 border-black rounded-2xl md:rounded-[2rem] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-black text-white text-[7px] md:text-[8px] font-black uppercase tracking-widest">
                        <tr>
                          <th className="px-4 py-3 md:px-6 md:py-4">Alimento</th>
                          <th className="px-4 py-3 md:px-6 md:py-4 text-right">Cho (g)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {estimatedItems.map((item, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="px-4 py-3 md:px-6 md:py-4 font-black text-black text-[10px] md:text-xs">
                              {item.name} 
                              <span className="text-[7px] md:text-[8px] text-slate-300 font-black block uppercase mt-0.5">{item.portion}</span>
                            </td>
                            <td className="px-4 py-3 md:px-6 md:py-4 text-right font-black text-black text-xs md:text-sm">{item.carbs}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-black p-6 rounded-2xl md:rounded-[2rem] flex justify-between items-baseline text-white border-2 border-black">
                    <span className="font-black uppercase text-[8px] md:text-[10px] tracking-widest">Totale Cho</span>
                    <span className="text-3xl md:text-4xl font-black tracking-tighter">{estimatedItems.reduce((acc, item) => acc + item.carbs, 0)}<span className="text-xs ml-1 uppercase opacity-40">g</span></span>
                  </div>

                  <button onClick={confirmCarbCalc} className="w-full bg-black text-white py-5 md:py-6 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-slate-800 transition-all border-2 border-black shadow-lg">
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
