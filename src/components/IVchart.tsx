import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { POLYGON_API_KEY } from '../config/polygon';

const OptionsIVChart = ({ tickers}) => {
  const [ivData, setIvData] = useState([]);
  const [error, setError] = useState(null);

  const fetchOptionsData = async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const tickerString = tickers.join(',');
      
      const response = await fetch(
        `https://api.polygon.io/v3/snapshot?ticker.any_of=${tickerString}&apiKey=${POLYGON_API_KEY}`
      );
      const result = await response.json();

      if (!result.results || result.results.length === 0) {
        throw new Error('No valid data received');
      }

      const validResults = result.results.filter(item => 
        item.options?.implied_volatility
      );

      if (validResults.length === 0) {
        throw new Error('No valid implied volatility data');
      }

      const averageIV = validResults.reduce((sum, item) => 
        sum + item.options.implied_volatility, 0
      ) / validResults.length;

      setIvData(prevData => [
        ...prevData,
        {
          timestamp,
          averageIV: (averageIV * 100).toFixed(2)
        }
      ]);
      
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchOptionsData();
    const interval = setInterval(fetchOptionsData, 5000);
    return () => clearInterval(interval);
  }, [tickers]);

  const formatXAxis = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const CustomDot = (props) => {
    const { cx, cy } = props;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={3} 
        fill="#2563eb" 
        stroke="white" 
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Average Implied Volatility</h2>
        <p className="text-sm text-gray-600">Total data points: {ivData.length}</p>
      </div>
      {/* {error ? (
        <div className="p-4 text-red-500 bg-red-50 rounded">Error: {error}</div>
      ) : ( */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ivData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis}
                label={{ value: 'Time', position: 'bottom' }}
              />
              <YAxis 
                label={{ 
                  value: 'Implied Volatility (%)', 
                  angle: -90, 
                  position: 'left' 
                }}
              />
              <Tooltip 
                labelFormatter={formatXAxis}
                formatter={(value) => [`${value}%`, 'IV']}
              />
              <Line 
                type="monotone" 
                dataKey="averageIV" 
                stroke="#2563eb"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 5, fill: "#2563eb", stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      {/* )} */}
    </div>
  );
};

export default OptionsIVChart;