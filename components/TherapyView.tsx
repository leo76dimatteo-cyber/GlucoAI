
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TherapyPlan, UserProfile } from '../types';

interface TherapyViewProps {
  currentUser: UserProfile;
  onSave: (plan: TherapyPlan) => void;
  initialPlan?: TherapyPlan;
}

const DEFAULT_PLAN: TherapyPlan = {
  longActingName: 'TRESIBA',
  longActingDose: '18 UNITA SEMPRE',
  lastUpdate: new Date().toLocaleDateString(),
  contacts: [
    { label: 'GENITORI - DONATELLA', number: '3343033736' },
    { label: 'GENITORI - LEONARDO', number: '3804590864' },
    { label: 'ACCETTAZIONE PEDIATRICA', number: '059 4225016' },
    { label: 'DIABETOLOGIA PEDIATRICA', number: '059 4224719' }
  ],
  slots: [
    {
      time: '07:30',
      label: 'COLAZIONE (Humalog)',
      rows: [
        { range: '70-100', dose: '2', wait: '0 MINUTI' },
        { range: '101-150', dose: '2,5', wait: '5 MINUTI' },
        { range: '151-200', dose: '2,5', wait: '10 MINUTI' },
        { range: '201-250', dose: '3', wait: '15 MINUTI' },
        { range: '251-300', dose: '3', wait: '20 MINUTI' },
        { range: '>301', dose: '3,5', wait: '25 MINUTI' }
      ]
    },
    {
      time: '10:00',
      label: 'MERENDA',
      rows: [
        { range: '100-200', dose: '1 UI', wait: '+ MERENDA' },
        { range: '201-250', dose: '1,5 UI', wait: '+ MERENDA' },
        { range: '> 251', dose: '2 UI', wait: '+ MERENDA' }
      ]
    },
    {
      time: '12:00',
      label: 'MERENDA SENZA CARBOIDRATI',
      rows: [
        { range: 'Libera', dose: '0 UI', wait: 'NO CHO' }
      ]
    },
    {
      time: '14:30',
      label: 'PRANZO (Humalog)',
      rows: [
        { range: '70-100', dose: '4,5', wait: '0-5 MINUTI' },
        { range: '101-150', dose: '5', wait: '5-10 MINUTI' },
        { range: '151-200', dose: '5,5', wait: '10-15 MINUTI' },
        { range: '201-250', dose: '6', wait: '15-20 MINUTI' },
        { range: '251-300', dose: '6,5', wait: '20-25 MINUTI' },
        { range: '> 301', dose: '7', wait: '30 MINUTI' }
      ]
    },
    {
      time: '16:30',
      label: 'MERENDA',
      rows: [
        { range: '100-200', dose: '1 UI', wait: '+ MERENDA' },
        { range: '201-250', dose: '1,5 UI', wait: '+ MERENDA' },
        { range: '> 251', dose: '2 UI', wait: '+ MERENDA' }
      ]
    },
    {
      time: '19:30',
      label: 'CENA (Humalog)',
      rows: [
        { range: '70-100', dose: '3,5', wait: '0 MINUTI' },
        { range: '101-150', dose: '4', wait: '5 MINUTI' },
        { range: '151-200', dose: '4', wait: '10 MINUTI' },
        { range: '201-300', dose: '4,5', wait: '15-20 MIN' },
        { range: '> 301', dose: '5', wait: '25 MINUTI' }
      ],
      notes: '- 0,5 se fa sport'
    },
    {
      time: '22:30',
      label: 'SPUNTINO PICCOLO',
      rows: [
        { range: 'SE < 100', dose: '1 UI', wait: 'CONTROLLO 2h' },
        { range: 'SE > 250', dose: '1,5 UI', wait: 'CORR. PIZZA' }
      ]
    },
    {
      time: '02:30',
      label: 'CONTROLLO NOTTE',
      rows: [
        { range: 'SE > 250', dose: '1 UI', wait: 'CONTROLLO 2h' }
      ]
    }
  ]
};

const TherapyView: React.FC<TherapyViewProps> = ({ currentUser, onSave, initialPlan }) => {
  const { t } = useLanguage();
  const [plan, setPlan] = useState<TherapyPlan>(initialPlan || DEFAULT_PLAN);

  const handleUpdateSlot = (slotIdx: number, rowIdx: number, field: 'range' | 'dose' | 'wait', value: string) => {
    const newSlots = [...plan.slots];
    newSlots[slotIdx].rows[rowIdx][field] = value;
    setPlan({ ...plan, slots: newSlots });
  };

  const handleUpdateContact = (idx: number, field: 'label' | 'number', value: string) => {
    const newContacts = [...plan.contacts];
    newContacts[idx][field] = value;
    setPlan({ ...plan, contacts: newContacts });
  };

  const handlePrint = () => {
    window.print();
  };

  const inputStyle = "bg-transparent border-none focus:ring-0 w-full p-0 text-center font-bold text-inherit placeholder:opacity-30";

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-12">
      {/* Header & Controls - Hidden on Print */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 border-b-2 border-slate-100 pb-6 md:pb-8 print:hidden">
        <div>
          <p className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.5em] text-indigo-500">Clinical Protocol</p>
          <h1 className="text-3xl md:text-7xl font-black text-black tracking-tighter uppercase leading-none">{t('therapy')}</h1>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <button onClick={handlePrint} className="flex-1 md:flex-none bg-white border-2 border-black text-black px-4 md:px-6 py-3 md:py-4 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            🖨️ {t('print_plan')}
          </button>
          <button onClick={() => onSave({ ...plan, lastUpdate: new Date().toLocaleDateString() })} className="flex-1 md:flex-none bg-indigo-600 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            💾 {t('save_plan')}
          </button>
        </div>
      </header>

      {/* Printable Sheet */}
      <div id="printable-therapy" className="bg-white p-2 md:p-12 print:p-0">
        <div className="border-[3px] md:border-[6px] border-black p-4 md:p-10 relative overflow-hidden bg-white rounded-[2rem] md:rounded-none">
          
          {/* Document Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 border-b-2 md:border-b-4 border-black pb-6 md:pb-8 gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-black text-white rounded-xl md:rounded-3xl flex items-center justify-center text-xl md:text-4xl font-black rotate-3 shrink-0">G</div>
              <div>
                <h2 className="text-xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">GlucoAI</h2>
                <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mt-1 md:mt-2">Diabetologia Pediatrica</p>
              </div>
            </div>
            <div className="text-left md:text-right space-y-1">
              <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest">Protocollo: <span className="text-indigo-600 ml-1 font-black">{currentUser.name}</span></p>
              <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest">Peso: <span className="text-indigo-600 ml-1 font-black">{currentUser.weight} kg</span></p>
              <p className="text-[6px] md:text-[8px] font-black uppercase text-slate-400 tracking-widest">{t('last_update')}: {plan.lastUpdate}</p>
            </div>
          </div>

          {/* Basale Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="md:col-span-2 bg-amber-400 border-[3px] md:border-4 border-black p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center">
                <h3 className="text-sm md:text-2xl font-black uppercase italic tracking-tighter">INSULINA BASALE</h3>
                <input 
                   className={`${inputStyle} text-xs md:text-xl w-auto text-right`}
                   value={plan.longActingName} 
                   onChange={(e) => setPlan({...plan, longActingName: e.target.value})}
                />
              </div>
              <div className="mt-2 md:mt-4 border-t-2 border-black/20 pt-2 md:pt-4">
                <input 
                   className={`${inputStyle} text-xl md:text-4xl text-left`}
                   value={plan.longActingDose} 
                   onChange={(e) => setPlan({...plan, longActingDose: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-emerald-400 border-[3px] md:border-4 border-black p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-[7px] md:text-xs font-black uppercase tracking-widest mb-2 md:mb-4">Emergenza</h3>
              <div className="space-y-2 md:space-y-3">
                {plan.contacts.slice(0, 2).map((c, i) => (
                  <div key={i} className="space-y-0.5">
                    <input className={`${inputStyle} text-[6px] md:text-[8px] text-left uppercase opacity-70 font-black`} value={c.label} onChange={(e) => handleUpdateContact(i, 'label', e.target.value)} />
                    <input className={`${inputStyle} text-[9px] md:text-sm text-left font-black`} value={c.number} onChange={(e) => handleUpdateContact(i, 'number', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dosage Table Grid - Mobile optimized scroll containers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {plan.slots.map((slot, sIdx) => (
              <div key={sIdx} className="border-[3px] md:border-4 border-black rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.03)] bg-white flex flex-col">
                <div className="bg-indigo-600 text-white p-3 md:p-5 flex justify-between items-center border-b-[3px] md:border-b-4 border-black">
                  <input className={`${inputStyle} text-white text-left w-auto text-[8px] md:text-xs uppercase tracking-widest`} value={slot.label} onChange={(e) => {
                    const ns = [...plan.slots]; ns[sIdx].label = e.target.value; setPlan({...plan, slots: ns});
                  }} />
                  <input className={`${inputStyle} text-white text-right w-auto text-lg md:text-2xl tracking-tighter`} value={slot.time} onChange={(e) => {
                    const ns = [...plan.slots]; ns[sIdx].time = e.target.value; setPlan({...plan, slots: ns});
                  }} />
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-center border-collapse min-w-[280px]">
                    <thead className="bg-slate-50 border-b-2 border-black">
                      <tr className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400">
                        <th className="py-2 px-2 border-r-2 border-black">Glicemia</th>
                        <th className="py-2 px-2 border-r-2 border-black">UI</th>
                        <th className="py-2 px-2">Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/5">
                      {slot.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-indigo-50/20">
                          <td className="py-2 md:py-3 border-r-2 border-black bg-slate-50/10">
                            <input className={`${inputStyle} text-[9px] md:text-[10px]`} value={row.range} onChange={(e) => handleUpdateSlot(sIdx, rIdx, 'range', e.target.value)} />
                          </td>
                          <td className="py-2 md:py-3 border-r-2 border-black font-black text-indigo-600">
                            <input className={`${inputStyle} text-sm md:text-lg`} value={row.dose} onChange={(e) => handleUpdateSlot(sIdx, rIdx, 'dose', e.target.value)} />
                          </td>
                          <td className="py-2 md:py-3 font-bold text-slate-500">
                            <input className={`${inputStyle} text-[8px] md:text-[9px]`} value={row.wait} onChange={(e) => handleUpdateSlot(sIdx, rIdx, 'wait', e.target.value)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {slot.notes && (
                  <div className="p-2 md:p-3 bg-rose-50 border-t-2 border-black/5">
                    <input className={`${inputStyle} text-[7px] md:text-[8px] text-rose-600 italic`} value={slot.notes} onChange={(e) => {
                      const ns = [...plan.slots]; ns[sIdx].notes = e.target.value; setPlan({...plan, slots: ns});
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Contacts */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t-2 md:border-t-4 border-black grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {plan.contacts.slice(2).map((c, i) => (
               <div key={i+2} className="space-y-0.5">
                 <input className={`${inputStyle} text-[6px] md:text-[7px] text-left uppercase text-slate-400 font-black`} value={c.label} onChange={(e) => handleUpdateContact(i+2, 'label', e.target.value)} />
                 <input className={`${inputStyle} text-[8px] md:text-[10px] text-left text-black font-black`} value={c.number} onChange={(e) => handleUpdateContact(i+2, 'number', e.target.value)} />
               </div>
            ))}
            <div className="md:col-span-2 text-right hidden md:block">
              <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-300">© 2025 GlucoAI Clinical Suite • Modulo Terapia Intensiva</p>
            </div>
          </div>

          {/* Decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-50/30 text-[6rem] md:text-[12rem] font-black -rotate-12 pointer-events-none select-none -z-10 uppercase">Protocol</div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          body * { visibility: hidden; }
          #printable-therapy, #printable-therapy * { visibility: visible; }
          #printable-therapy { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 10mm;
            box-sizing: border-box;
          }
          .print\\:hidden { display: none !important; }
          input { border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default TherapyView;
