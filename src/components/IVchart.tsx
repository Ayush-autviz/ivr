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
  const { tickers, ivData, error, setError,ticker } = useTickerStore();
  const [sma, setSma] = useState('None');
  const [lma, setLma] = useState('None');

  const [scrollPosition, setScrollPosition] = useState(0);

  console.log(sma,'sma')

  const smaOptions = ['None', '5', '10', '20', '30', '40'];
  const lmaOptions = ['None', '50', '60', '75', '90', '120', '150'];

  useEffect(() => {
    if (tickers.length < 2) {
      setError("Select at least two contracts to track");
    }
  }, [tickers]);


  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp * 1000);
    if (date.getMinutes() === 0) {
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
    }
    return '';
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
              hour12: true
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

  console.log(ivData,'ivdata');

  const handleScroll = (e) => {
    setScrollPosition(e.target.scrollLeft);
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl mx-10 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
        {ticker}-Average Implied Volatility
        </h2>
        <p className="text-gray-600 mt-1">
  {tickers?.length > 0 && (
    <>
      Tracking:
      {tickers.map((ticker, index) => (
        <span key={index} className="ml-1">
          {ticker.details?.strike_price} {ticker.details?.contract_type}
          {index < tickers.length - 1 && ','}
        </span>
      ))}
    </>
  )}
</p>
        
        <div className="flex gap-4 mt-4">
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short-term Moving Average
            </label>
            <select
              value={sma}
              onChange={(e) => setSma(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {smaOptions.map(option => (
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
              {lmaOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'None' ? 'No LMA' : `${option} periods`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      ) : (        
        <div className="h-[400px] mt-4  ">
        {/* Scrollable container */}
   
            <ResponsiveContainer width='100%'  height="100%">
              <ComposedChart
                data={ivData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  padding={{ left: 30, right: 30 }}
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
                  isAnimationActive={false}
                  connectNulls={true}
                />
                {sma !== 'None' && (
                  <Line
                    type="monotone"
                    dataKey={`MA${sma}`}
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name={`SMA(${sma})`}
                    connectNulls={true}
                    isAnimationActive={false}
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
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
   
      </div>
      )}
    </div>
  );
};

export default OptionsIVChart;