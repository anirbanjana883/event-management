import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

const SalesChart = ({ data }) => {
  // Transform data: ensure it's sorted and formatted
  const chartData = data?.map(item => ({
    date: format(parseISO(item._id), 'MMM d'), // "Jan 14"
    sales: item.ticketsSold,
    revenue: item.revenue
  }));

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-[#111] rounded-xl border border-[#333]">
        No sales data available yet
      </div>
    );
  }

  return (
    <div className="bg-[#111] p-6 rounded-xl border border-[#333] shadow-lg">
      <h3 className="text-lg font-bold text-white mb-6">Sales Velocity</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#666" 
              tick={{fill: '#666', fontSize: 12}}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#666" 
              tick={{fill: '#666', fontSize: 12}}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSales)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;