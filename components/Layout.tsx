
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../translations';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'logs' | 'ai';
  onTabChange: (tab: 'dashboard' | 'logs' | 'ai') => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onEditProfile: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  currentUser,
  onLogout,
  onEditProfile
}) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'it', label: 'IT' },
    { code: 'en', label: 'EN' },
  ];

  const LanguageSwitcher = () => (
    <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border-2 border-black/5">
      {languages.map((lang) => (
        <button 
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${language === lang.code ? 'bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 hover:text-black'}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF] text-black">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-80 bg-white border-r-4 border-black flex-col p-8 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">G</div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter uppercase leading-none italic">GlucoAI</span>
              <span className="text-[8px] font-black tracking-[0.6em] text-indigo-400 uppercase">Pro Edition</span>
            </div>
        </div>

        {/* Profile Card */}
        <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center text-black font-black text-xl shrink-0 shadow-[2px_2px_0px_0px_rgba(79,70,229,1)]">
                 {currentUser.name.charAt(0).toUpperCase()}
               </div>
               <div className="overflow-hidden space-y-0.5">
                 <p className="font-black text-black truncate leading-none uppercase text-[10px] tracking-tight">{currentUser.name}</p>
                 <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                   {currentUser.weight}KG • {currentUser.id.slice(-4)}
                 </p>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={onEditProfile} className="text-[8px] font-black uppercase text-black py-2.5 bg-white rounded-lg border-2 border-black hover:bg-slate-50 transition-all">
                 {t('edit')}
               </button>
               <button onClick={onLogout} className="text-[8px] font-black uppercase text-white py-2.5 bg-black rounded-lg border-2 border-black hover:bg-slate-800 transition-all">
                 {t('logout')}
               </button>
             </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => onTabChange('dashboard')} className={`w-full text-left px-6 py-4 rounded-xl transition-all flex items-center gap-4 border-2 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 border-transparent hover:bg-slate-50 hover:text-black'}`}>
            <span className="text-xl">📊</span> <span className="uppercase text-[9px] font-black tracking-[0.2em]">{t('dashboard')}</span>
          </button>
          <button onClick={() => onTabChange('logs')} className={`w-full text-left px-6 py-4 rounded-xl transition-all flex items-center gap-4 border-2 ${activeTab === 'logs' ? 'bg-indigo-600 text-white font-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 border-transparent hover:bg-slate-50 hover:text-black'}`}>
            <span className="text-xl">📓</span> <span className="uppercase text-[9px] font-black tracking-[0.2em]">{t('logs')}</span>
          </button>
          <button onClick={() => onTabChange('ai')} className={`w-full text-left px-6 py-4 rounded-xl transition-all flex items-center gap-4 border-2 ${activeTab === 'ai' ? 'bg-indigo-600 text-white font-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 border-transparent hover:bg-slate-50 hover:text-black'}`}>
            <span className="text-xl">🤖</span> <span className="uppercase text-[9px] font-black tracking-[0.2em]">{t('ai_coach')}</span>
          </button>
        </nav>

        <div className="mt-auto pt-8 space-y-6">
          <LanguageSwitcher />
          
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
              {t('disclaimer')}
            </p>
            <div className="h-0.5 bg-slate-200 my-2 rounded-full"></div>
            <p className="text-[6px] text-slate-300 font-bold uppercase tracking-tighter leading-tight">
              {t('trademark_disclaimer')}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-14 overflow-y-auto pb-40 md:pb-14 bg-white">
        {children}
      </main>

      {/* Mobile Nav - Native App Look */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black flex justify-around items-center h-24 z-[500] px-6">
        <button onClick={() => onTabChange('dashboard')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 font-black -translate-y-2' : 'text-slate-300'}`}>
          <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}>📊</div>
          <span className="text-[8px] font-black uppercase">Dash</span>
        </button>
        <button onClick={() => onTabChange('logs')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'logs' ? 'text-indigo-600 font-black -translate-y-2' : 'text-slate-300'}`}>
          <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl ${activeTab === 'logs' ? 'bg-indigo-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}>📓</div>
          <span className="text-[8px] font-black uppercase">Logs</span>
        </button>
        <button onClick={() => onTabChange('ai')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'ai' ? 'text-indigo-600 font-black -translate-y-2' : 'text-slate-300'}`}>
          <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl ${activeTab === 'ai' ? 'bg-indigo-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}>🤖</div>
          <span className="text-[8px] font-black uppercase">Coach</span>
        </button>
        <button onClick={onLogout} className="flex flex-col items-center gap-1 p-2 text-rose-500">
          <div className="text-2xl">🚪</div>
          <span className="text-[8px] font-black uppercase">Exit</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
