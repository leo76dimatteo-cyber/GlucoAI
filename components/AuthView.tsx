
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../types';

interface AuthViewProps {
  onLogin: (user: UserProfile) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [error, setError] = useState('');
  const [recoveredData, setRecoveredData] = useState<string | null>(null);

  const [form, setForm] = useState({
    taxCode: '',
    password: '',
    name: '',
    age: '',
    height: '',
    weight: ''
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem('glucoUsers') || '[]');

    if (mode === 'login') {
      const user = users.find((u: any) => u.id === form.taxCode.toUpperCase() && u.password === form.password);
      if (user) {
        onLogin(user);
      } else {
        setError('CF o Password errati.');
      }
    } else if (mode === 'register') {
      if (users.some((u: any) => u.id === form.taxCode.toUpperCase())) {
        setError('Utente già registrato.');
        return;
      }
      const newUser: UserProfile = {
        id: form.taxCode.toUpperCase(),
        name: form.name,
        password: form.password,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('glucoUsers', JSON.stringify(users));
      onLogin(newUser);
    } else if (mode === 'recovery') {
      const user = users.find((u: any) => u.id === form.taxCode.toUpperCase());
      if (user) {
        setRecoveredData(`Dati: ${user.name} - Pass: ${user.password}`);
      } else {
        setError('Nessun utente trovato.');
      }
    }
  };

  const inputClasses = "w-full p-3 md:p-4 bg-white border-2 border-black rounded-xl font-black text-black caret-indigo-600 outline-none transition-all placeholder:text-slate-300 focus:border-indigo-600 focus:shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]";

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white border-4 border-black rounded-[2.5rem] p-6 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">G</div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">{mode === 'login' ? 'Login' : mode === 'register' ? 'Join' : 'Reset'}</h1>
            <p className="text-indigo-600 font-black uppercase text-[9px] tracking-[0.2em] mt-2">
              {mode === 'login' ? t('login') : mode === 'register' ? t('add_profile') : t('recovery_title')}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1 block">{t('tax_code')}</label>
              <input required className={`${inputClasses} uppercase`} placeholder="---" value={form.taxCode} onChange={(e) => setForm({...form, taxCode: e.target.value})} />
            </div>

            {mode !== 'recovery' && (
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1 block">{t('password')}</label>
                <input required type="password" className={inputClasses} placeholder="••••••••" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-4 pt-1 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1 block">{t('profile_name')}</label>
                  <input required className={inputClasses} placeholder="Your Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="Anni" className={inputClasses + " px-1 text-center"} value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} />
                  <input type="number" placeholder="Cm" className={inputClasses + " px-1 text-center"} value={form.height} onChange={(e) => setForm({...form, height: e.target.value})} />
                  <input type="number" placeholder="Kg" className={inputClasses + " px-1 text-center"} value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} />
                </div>
              </div>
            )}

            {error && <div className="bg-rose-50 border-2 border-rose-600 p-2 rounded-xl text-rose-600 text-[9px] font-black uppercase text-center">{error}</div>}
            {recoveredData && <div className="bg-indigo-600 border-2 border-black p-3 rounded-xl text-white text-[9px] font-black uppercase text-center">{recoveredData}</div>}

            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all mt-4 border-2 border-black">
               {mode === 'login' ? t('login') : mode === 'register' ? t('create') : t('confirm')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-slate-100 flex flex-col gap-3 text-center">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('register')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{t('no_account')}</button>
                <button onClick={() => setMode('recovery')} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">{t('forgot_password')}?</button>
              </>
            ) : (
              <button onClick={() => { setMode('login'); setRecoveredData(null); }} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{t('has_account')}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
