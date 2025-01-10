import  { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import useTickerStore from '../store/tickerStore';

const TimeframeCharts = () => {
    const { stocks, error, setError, removeStock } = useTickerStore();
  const chartRefs = {
    '1min': useRef(null),
    '5min': useRef(null),
    '10min': useRef(null),
    '15min': useRef(null),
    '30min': useRef(null)
  };

  const processData = (rawData, timeframe) => {
    const minutes = parseInt(timeframe);
    const dataPoints = (minutes * 60) / 5; // Convert to number of 5-second intervals
    const processedData = [];
    
    
    for (let i = 0; i < rawData.length; i += dataPoints) {
      const slice = rawData.slice(i, i + dataPoints);
      if (slice.length === dataPoints) {
        const startingIV = parseFloat(slice[0].averageIV);
        const currentIV = parseFloat(slice[slice.length - 1].averageIV);
        const startingVega = parseFloat(slice[0].averageVega);
        const currentVega = parseFloat(slice[slice.length - 1].averageVega);
        const startingTheta = parseFloat(slice[0].averageTheta);
        const currentTheta = parseFloat(slice[slice.length - 1].averageTheta);
        
        const averageVega = (startingVega + currentVega) / 2;
        const averageTheta = (startingTheta + currentTheta) / 2;
        const ivChange = currentIV - startingIV;
        const vegaPriceChange = ivChange * averageVega;
        const thetaPriceChange = (averageTheta / 1440) * (minutes);
        
        const startingAvgPremiumPrice = 
          (slice[0].averageBid + slice[0].averageAsk) / 2 + 
          Math.abs(thetaPriceChange) - vegaPriceChange;
        
        const currentAvgPremiumPrice = 
          (slice[slice.length - 1].averageBid + slice[slice.length - 1].averageAsk) / 2;
        
        const netPriceChangePercentage = 
          (currentAvgPremiumPrice / startingAvgPremiumPrice - 1) * 100;

        processedData.push({
          time: slice[slice.length - 1].timestamp / 1000,
          value: parseFloat(netPriceChangePercentage.toFixed(2))
        });
      }
    }
    return processedData;
  };

  useEffect(() => {
    Object.entries(chartRefs).forEach(([timeframe, ref]) => {
      if (ref.current) {
        const chart = createChart(ref.current, {
          width: 400,
          height: 200,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
        });

        const lineSeries = chart.addLineSeries({
          color: '#2962FF',
          lineWidth: 2,
        });

        // Sample data processing - replace with your actual data
        const sampleData = [/* Your 5-second interval data here */];
        const processedData = processData(stocks[0].ivData, timeframe.replace('min', ''));
        lineSeries.setData(processedData);

        chart.timeScale().fitContent();

        return () => chart.remove();
      }
    });
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {Object.entries(chartRefs).map(([timeframe, ref]) => (
        <div key={timeframe} className="border rounded p-2">
          <h3 className="text-lg font-semibold mb-2">{timeframe} Chart</h3>
          <div ref={ref} />
        </div>
      ))}
    </div>
  );
};

export default TimeframeCharts;