
import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ReferenceArea, Bar, ComposedChart
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const glucose = payload.find((p: any) => p.dataKey === 'level')?.value;
      const carbs = payload.find((p: any) => p.dataKey === 'carbs')?.value;
      const insulin = payload.find((p: any) => p.dataKey === 'insulin')?.value;
      const fullDate = payload[0]?.payload?.fullDateTime;

      return (
        <div className="bg-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl text-[10px] font-black uppercase">
          <p className="text-indigo-400 mb-3 tracking-[0.2em]">{fullDate}</p>
          <div className="space-y-2">
            <div className="flex justify-between gap-6 items-center">
              <span className="text-black">Glucose</span>
              <span className="text-indigo-600 text-sm">{glucose} mg/dL</span>
            </div>
            {carbs > 0 && (
              <div className="flex justify-between gap-6 items-center border-t-2 border-slate-50 pt-2">
                <span className="text-black">Carbs</span>
                <span className="text-amber-500">{carbs}g</span>
              </div>
            )}
            {insulin > 0 && (
              <div className="flex justify-between gap-6 items-center">
                <span className="text-black">Insulin</span>
                <span className="text-rose-500">{insulin}u</span>
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
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
          
          <ReferenceArea 
            y1={GLUCOSE_THRESHOLDS.TARGET_MIN} 
            y2={GLUCOSE_THRESHOLDS.TARGET_MAX} 
            fill="#10b981" 
            fillOpacity={0.05} 
          />

          <XAxis 
            dataKey={getXAxisKey()} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
            dy={10}
            minTickGap={range === 'day' ? 30 : 50}
          />
          <YAxis 
            domain={[40, 300]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          <ReferenceLine y={GLUCOSE_THRESHOLDS.HYPER} stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 6" />
          <ReferenceLine y={GLUCOSE_THRESHOLDS.HYPO} stroke="#f43f5e" strokeWidth={2} strokeDasharray="6 6" />

          <Bar dataKey="carbs" barSize={range === 'day' ? 20 : 8} fill="#fbbf24" radius={[4, 4, 0, 0]} opacity={0.3} />

          <Area 
            type="monotone" 
            dataKey="level" 
            stroke="#4f46e5" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorGlucose)" 
            dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, fill: '#4f46e5', stroke: '#000', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
