import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

const RSIChart = ({ 
  data, 
  containerRef, 
  period = 14,
  overbought = 70,
  oversold = 30 
}) => {
  const chartRef = useRef(null);
  const rsiSeriesRef = useRef(null);
  const chartContainerRef = useRef(null);

  // Calculate RSI
  const calculateRSI = (data, period = 14) => {
    const rsiData = [];
    const prices = data.map(d => d.close);
    
    let gains = [];
    let losses = [];
    
    // Calculate initial gains and losses
    for (let i = 1; i < prices.length; i++) {
      const difference = prices[i] - prices[i - 1];
      gains.push(difference > 0 ? difference : 0);
      losses.push(difference < 0 ? Math.abs(difference) : 0);
    }

    // Calculate RSI for each point
    for (let i = 0; i < prices.length; i++) {
      if (i < period) {
        rsiData.push({ time: data[i].time });
        continue;
      }

      // Calculate average gains and losses over the period
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;

      // Calculate RS and RSI
      const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
      const rsi = 100 - (100 / (1 + rs));

      rsiData.push({
        time: data[i].time,
        value: rsi
      });
    }

    return rsiData;
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Create RSI chart
    const chart = createChart(chartContainerRef.current, {
      width: containerRef.current.clientWidth,
      height: 150,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#d1d5db',
      },
      timeScale: {
        borderColor: '#d1d5db',
        timeVisible: true,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
    });

    // Add RSI line series
    const rsiSeries = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: value => value.toFixed(2),
      },
      priceLineVisible: false,
    });

    // Add overbought and oversold lines
    const overboughtLine = chart.addLineSeries({
      color: '#FF4444',
      lineWidth: 1,
      lineStyle: 1,
      priceLineVisible: false,
    });

    const oversoldLine = chart.addLineSeries({
      color: '#4CAF50',
      lineWidth: 1,
      lineStyle: 1,
      priceLineVisible: false,
    });

    // Set overbought/oversold lines
    const timeRange = data.map(d => ({ time: d.time }));
    overboughtLine.setData(timeRange.map(t => ({ ...t, value: overbought })));
    oversoldLine.setData(timeRange.map(t => ({ ...t, value: oversold })));

    // Calculate and set initial RSI data
    const rsiData = calculateRSI(data, period);
    rsiSeries.setData(rsiData);

    chartRef.current = chart;
    rsiSeriesRef.current = rsiSeries;

    // Handle resize
    const handleResize = () => {
      chart.applyOptions({
        width: containerRef.current.clientWidth,
      });
    };

    window.addEventListener('resize', handleResize);

    // Update RSI with new data
    if (data.length > 0) {
      const newRSIData = calculateRSI(data, period);
      const lastRSI = newRSIData[newRSIData.length - 1];
      if (lastRSI && lastRSI.value) {
        rsiSeriesRef.current?.update(lastRSI);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, period, overbought, oversold]);

  return (
    <div className="mt-4">
    
      <div 
        ref={chartContainerRef} 
        className="w-full"
      />
    </div>
  );
};

export default RSIChart;