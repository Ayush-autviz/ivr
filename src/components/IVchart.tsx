import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import useTickerStore from '../store/tickerStore';

const OptionsIVChart = () => {
  const { tickers, ivData, error,setError } = useTickerStore();

  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp * 1000);
    // Only show label if it's at the start of an hour
    if (date.getMinutes() === 0) {
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        hour12: true
      }).toLowerCase().replace(' ', '');
    }
    return '';
  };

  useEffect(()=>{
        if(tickers.length<2){
          setError("Select atleast two contracts to track")
        }
  },[tickers])

  const CustomTooltip = ({ active, payload, label }) => {
    console.log(active, payload, label);
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
          {/* <p className="text-sm font-semibold text-blue-600">
            IV: {payload[0]?.value?.toFixed(2)}%
          </p> */}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    
    // Don't render dots for null or undefined values
    if (!payload.averageIV) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={0}
        fill="#2563eb"
        stroke="white"
        strokeWidth={2}
        className="transition-all duration-300 ease-in-out hover:r-4"
      />
    );
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl mx-10 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Average Implied Volatility
        </h2>
        <p className="text-gray-600 mt-1">
          {tickers?.length > 0 && `Tracking ${tickers.join(', ')}`}
        </p>
      </div>

      {error ? (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-100">
           {error}
        </div>
      ) : (
        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={ivData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="#f0f0f0"
              />
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
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={() => 'Implied Volatility'}
              />
              <Line
                type="monotone"
                dataKey="averageIV"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={<CustomDot />}
                activeDot={{
                  r: 6,
                  fill: "#2563eb",
                  stroke: "white",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default OptionsIVChart;