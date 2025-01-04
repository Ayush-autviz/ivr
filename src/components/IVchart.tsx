import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import useTickerStore from '../store/tickerStore';

const OptionsIVChart = () => {
  const { stocks, error, setError } = useTickerStore();
  const [sma, setSma] = useState('None');
  const [lma, setLma] = useState('None');

  const smaOptions = ['None', '5', '10', '20', '30', '40'];
  const lmaOptions = ['None', '50', '60', '75', '90', '120', '150'];

  useEffect(() => {
    if (stocks.length < 1) {
      setError('Add at least one stock to track');
    }
  }, [stocks]);

  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label * 1000);
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="text-sm text-gray-600 mb-1">
            {date.toLocaleString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }).toLowerCase()}
          </p>
          {/* {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm font-semibold"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value?.toFixed(2)}%
            </p>
          ))} */}
        </div>
      );
    }
    return null;
  };

  return (
    <div className='flex flex-col w-full mx-10 gap-10'>
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}
      {stocks.map((stock) => (
        <div className="w-full p-6  bg-white rounded-xl shadow-lg">
        <div key={stock.symbol} className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 ">
            {stock.symbol} - Average Implied Volatility
          </h2>
          <p className="text-gray-600 mt-1 mb-4">

      Tracking: {stock.tracking}

</p>
          <div className="flex gap-4 mb-6">
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short-term Moving Average
              </label>
              <select
                value={sma}
                onChange={(e) => setSma(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {smaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'None' ? 'No SMA' : `${option} periods`}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long-term Moving Average
              </label>
              <select
                value={lma}
                onChange={(e) => setLma(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {lmaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'None' ? 'No LMA' : `${option} periods`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={stock.ivData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${value}%`}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="averageIV"
                  stroke="#2563eb"
                  fill="#2563eb20"
                  strokeWidth={2}
                  name="IV"
                  connectNulls
                />
                {sma !== 'None' && (
                  <Line
                    type="monotone"
                    dataKey={`MA${sma}`}
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name={`SMA(${sma})`}
                    connectNulls
                  />
                )}
                {lma !== 'None' && (
                  <Line
                    type="monotone"
                    dataKey={`MA${lma}`}
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name={`LMA(${lma})`}
                    connectNulls
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      ))}
    </div>
  );
};

export default OptionsIVChart;
