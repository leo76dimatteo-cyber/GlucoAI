
import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ReferenceArea, Bar, ComposedChart, Scatter, Cell
} from 'recharts';
import { GlucoseLog } from '../types';
import { GLUCOSE_THRESHOLDS } from '../constants';

interface TrendChartProps {
  logs: GlucoseLog[];
  range: 'day' | 'week' | 'month';
}

const TrendChart: React.FC<TrendChartProps> = ({ logs, range }) => {
  const data = logs.map(log => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(log.timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit' }),
    fullDateTime: `${new Date(log.timestamp).toLocaleDateString()} ${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    level: log.sensorLevel || log.stickLevel || 0,
    carbs: log.carbs || 0,
    insulin: log.insulinUnits || 0,
    timestamp: new Date(log.timestamp).getTime()
  })).sort((a, b) => a.timestamp - b.timestamp);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const glucose = payload.find((p: any) => p.dataKey === 'level')?.value;
      const carbs = payload.find((p: any) => p.dataKey === 'carbs')?.value;
      const insulin = payload.find((p: any) => p.dataKey === 'insulin')?.value;
      const dataPoint = payload[0]?.payload;

      return (
        <div className="bg-white/95 backdrop-blur-md p-5 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem] min-w-[180px] animate-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-3">
            <header className="border-b-2 border-slate-100 pb-2 mb-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{dataPoint.fullDateTime}</p>
            </header>
            
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[7px] font-black uppercase text-indigo-500 tracking-widest">Glicemia</span>
                <span className="text-2xl font-black text-black tracking-tighter leading-none">{glucose} <span className="text-[10px] opacity-40">mg/dL</span></span>
              </div>
              <div className={`w-3 h-3 rounded-full border-2 border-black ${glucose > GLUCOSE_THRESHOLDS.HYPER ? 'bg-amber-400' : glucose < GLUCOSE_THRESHOLDS.HYPO ? 'bg-rose-500' : 'bg-emerald-400'}`}></div>
            </div>

            {(carbs > 0 || insulin > 0) && (
              <div className="grid grid-cols-2 gap-2 mt-1 pt-3 border-t-2 border-slate-50">
                {carbs > 0 && (
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase text-amber-500 tracking-widest">Carbs</span>
                    <span className="text-xs font-black text-black">{carbs}g</span>
                  </div>
                )}
                {insulin > 0 && (
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase text-rose-500 tracking-widest">Insulina</span>
                    <span className="text-xs font-black text-black">{insulin}u</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getXAxisKey = () => {
    if (range === 'day') return 'time';
    return 'date';
  };

  return (
    <div className="h-full w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
          <defs>
            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
              <stop offset="50%" stopColor="#4f46e5" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
            <filter id="shadow" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
              <feMerge>
                <feMergeNode in="offsetBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" strokeOpacity={0.8} />
          
          <ReferenceArea 
            y1={GLUCOSE_THRESHOLDS.TARGET_MIN} 
            y2={GLUCOSE_THRESHOLDS.TARGET_MAX} 
            fill="#10b981" 
            fillOpacity={0.04} 
          />

          <XAxis 
            dataKey={getXAxisKey()} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
            dy={15}
            minTickGap={range === 'day' ? 40 : 60}
          />
          <YAxis 
            domain={[40, 320]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
            dx={-5}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#000', strokeWidth: 2, strokeDasharray: '6 6' }}
            animationDuration={200}
          />
          
          <ReferenceLine 
            y={GLUCOSE_THRESHOLDS.HYPER} 
            stroke="#f59e0b" 
            strokeWidth={2} 
            strokeDasharray="10 10"
            label={{ position: 'right', value: 'IPER', fill: '#f59e0b', fontSize: 7, fontWeight: 900, dx: -25, dy: -10 }}
          />
          <ReferenceLine 
            y={GLUCOSE_THRESHOLDS.HYPO} 
            stroke="#f43f5e" 
            strokeWidth={2} 
            strokeDasharray="10 10"
            label={{ position: 'right', value: 'IPO', fill: '#f43f5e', fontSize: 7, fontWeight: 900, dx: -25, dy: 15 }}
          />

          {/* Bars for Carbohydrates - More subtle and rounded */}
          <Bar 
            dataKey="carbs" 
            barSize={range === 'day' ? 24 : 10} 
            fill="#fbbf24" 
            radius={[6, 6, 0, 0]} 
            opacity={0.2}
            animationDuration={1500}
          />

          {/* Main Glucose Area */}
          <Area 
            type="monotone" 
            dataKey="level" 
            stroke="#4f46e5" 
            strokeWidth={5}
            fillOpacity={1} 
            fill="url(#colorGlucose)" 
            animationDuration={1000}
            dot={{ r: 4, fill: '#fff', strokeWidth: 3, stroke: '#000' }}
            activeDot={{ r: 8, fill: '#4f46e5', stroke: '#000', strokeWidth: 3 }}
            isAnimationActive={true}
          />

          {/* Scatter dots for Insulin events to highlight them on the chart */}
          <Scatter 
            dataKey="insulin" 
            fill="#f43f5e"
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.insulin > 0 ? '#f43f5e' : 'transparent'} 
                stroke={entry.insulin > 0 ? '#000' : 'transparent'}
                strokeWidth={2}
                r={entry.insulin > 0 ? 5 : 0}
              />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
