import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { POLYGON_API_KEY } from '../config/polygon';
import RSIChart from './RsiChart';

const LightweightCandlestick = ({ symbol }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [timeframe, setTimeframe] = useState('1');
  const time = ["1", "5", "10", "15", "30"]
  // References for indicator series
  const upperBandSeriesRef = useRef(null);
  const middleBandSeriesRef = useRef(null);
  const lowerBandSeriesRef = useRef(null);
  const ma30SeriesRef = useRef(null);
  const ma120SeriesRef = useRef(null);

  // Calculate Bollinger Bands
  const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
    const prices = data.map(d => d.close);
    const bbandsData = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        bbandsData.push({ time: data[i].time });
        continue;
      }

      const slice = prices.slice(i - period + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      const sma = sum / period;

      const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      const stdDev = Math.sqrt(variance);

      bbandsData.push({
        time: data[i].time,
        upper: sma + (multiplier * stdDev),
        middle: sma,
        lower: sma - (multiplier * stdDev),
      });
    }
    return bbandsData;
  };

  // Calculate Moving Average
  const calculateMA = (data, period) => {
    const maData = [];
    const prices = data.map(d => d.close);

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        maData.push({ time: data[i].time });
        continue;
      }

      const slice = prices.slice(i - period + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      const ma = sum / period;

      maData.push({
        time: data[i].time,
        value: ma,
      });
    }
    return maData;
  };

  // Update all technical indicators
  const updateIndicators = (data) => {
    if (data.length === 0) return;

    // Calculate and update Bollinger Bands
    const bbandsData = calculateBollingerBands(data);
    const lastBBand = bbandsData[bbandsData.length - 1];

    upperBandSeriesRef.current?.update({ time: lastBBand.time, value: lastBBand.upper });
    middleBandSeriesRef.current?.update({ time: lastBBand.time, value: lastBBand.middle });
    lowerBandSeriesRef.current?.update({ time: lastBBand.time, value: lastBBand.lower });

    // Calculate and update Moving Averages
    const ma30Data = calculateMA(data, 30);
    const ma120Data = calculateMA(data, 120);

    const lastMA30 = ma30Data[ma30Data.length - 1];
    const lastMA120 = ma120Data[ma120Data.length - 1];

    ma30SeriesRef.current?.update(lastMA30);
    ma120SeriesRef.current?.update(lastMA120);
  };

  const formatCandleData = (candle) => ({
    time: candle.t ? new Date(candle.t).getTime() / 1000 : new Date(candle.timestamp).getTime() / 1000,
    open: candle.o || candle.open,
    high: candle.h || candle.high,
    low: candle.l || candle.low,
    close: candle.c || candle.close,
  });

  const formatCandleData2 = (candle) => ({
    time: new Date(candle.timestamp).getTime() / 1000,
    open: candle.o || candle.open,
    high: candle.h || candle.high,
    low: candle.l || candle.low,
    close: candle.close,
  });

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
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
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#d1d5db',
        timeVisible: true,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
    });

    // Create all series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // Create and store references to indicator series
    upperBandSeriesRef.current = chart.addLineSeries({
      color: 'rgba(100, 149, 237, 0.5)',
      lineWidth: 1,
      priceLineVisible: false,
    });

    middleBandSeriesRef.current = chart.addLineSeries({
      color: 'rgba(100, 149, 237, 0.8)',
      lineWidth: 1,
      priceLineVisible: false,
    });

    lowerBandSeriesRef.current = chart.addLineSeries({
      color: 'rgba(100, 149, 237, 0.5)',
      lineWidth: 1,
      priceLineVisible: false,
    });

    ma30SeriesRef.current = chart.addLineSeries({
      color: '#ff9800',
      lineWidth: 1,
      priceLineVisible: false,
    });

    ma120SeriesRef.current = chart.addLineSeries({
      color: '#9c27b0',
      lineWidth: 1,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    chart.subscribeCrosshairMove(param => {
      if (!param.time || !param.point) return;

      const candleData = param.seriesData.get(candlestickSeriesRef.current);
      if (!candleData) return;

      const tooltipEl = document.getElementById('chart-tooltip');
      if (!tooltipEl) return;

      const time = new Date(param.time * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).toLowerCase();

      const ma30Value = param.seriesData.get(ma30SeriesRef.current)?.value;
      const ma120Value = param.seriesData.get(ma120SeriesRef.current)?.value;
      const bbUpper = param.seriesData.get(upperBandSeriesRef.current)?.value;
      const bbMiddle = param.seriesData.get(middleBandSeriesRef.current)?.value;
      const bbLower = param.seriesData.get(lowerBandSeriesRef.current)?.value;

      tooltipEl.style.display = 'block';
      tooltipEl.style.left = `${param.point.x}px`;
      tooltipEl.style.top = `${param.point.y}px`;
      tooltipEl.innerHTML = `
        <p class="text-sm text-gray-600 mb-1">${time}</p>
        <p class="text-sm font-semibold">Open: ${candleData.open.toFixed(2)}</p>
        <p class="text-sm font-semibold">High: ${candleData.high.toFixed(2)}</p>
        <p class="text-sm font-semibold">Low: ${candleData.low.toFixed(2)}</p>
        <p class="text-sm font-semibold">Close: ${candleData.close.toFixed(2)}</p>
        ${ma30Value ? `<p class="text-sm font-semibold" style="color: #ff9800">MA30: ${ma30Value.toFixed(2)}</p>` : ''}
        ${ma120Value ? `<p class="text-sm font-semibold" style="color: #9c27b0">MA120: ${ma120Value.toFixed(2)}</p>` : ''}
        ${bbUpper ? `<p class="text-sm font-semibold" style="color: rgba(100, 149, 237, 0.8)">BB Upper: ${bbUpper.toFixed(2)}</p>` : ''}
        ${bbMiddle ? `<p class="text-sm font-semibold" style="color: rgba(100, 149, 237, 0.8)">BB Middle: ${bbMiddle.toFixed(2)}</p>` : ''}
        ${bbLower ? `<p class="text-sm font-semibold" style="color: rgba(100, 149, 237, 0.8)">BB Lower: ${bbLower.toFixed(2)}</p>` : ''}
      `;
    });

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener('resize', handleResize);

    const fetchHistoricalData = async () => {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        console.log(startDate, endDate)

        const response = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${timeframe}/minute/${startDate}/${endDate}?limit=50000&apiKey=${POLYGON_API_KEY}`
        );

        const data = await response.json();
        if (data.results) {
          const formattedData = data.results.map(formatCandleData);
          setHistoricalData(formattedData);
          console.log(formattedData, 'formatted')
          candlestickSeries.setData(formattedData);

          // Calculate and set initial indicators
          const bbandsData = calculateBollingerBands(formattedData);
          upperBandSeriesRef.current.setData(bbandsData.map(d => ({ time: d.time, value: d.upper })));
          middleBandSeriesRef.current.setData(bbandsData.map(d => ({ time: d.time, value: d.middle })));
          lowerBandSeriesRef.current.setData(bbandsData.map(d => ({ time: d.time, value: d.lower })));

          const ma30Data = calculateMA(formattedData, 30);
          const ma120Data = calculateMA(formattedData, 120);
          ma30SeriesRef.current.setData(ma30Data);
          ma120SeriesRef.current.setData(ma120Data);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();

    const connectWebSocket = () => {
      const ws = new WebSocket('wss://socket.polygon.io/stocks');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Polygon WebSocket');
        ws.send(JSON.stringify({
          action: 'auth',
          params: POLYGON_API_KEY
        }));
        ws.send(JSON.stringify({
          action: 'subscribe',
          params: `A.${symbol}`
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message, 'message')
        if (message[0].ev === 'A') {
          const candleData = formatCandleData2({
            timestamp: Math.floor(message[0].e),
            close: message[0].c,
            open: message[0].o,
            high: message[0].h,
            low: message[0].l,
          });



          // Update candlestick data


          // Update historical data array and recalculate indicators
          setHistoricalData((prevData) => {
            const newData = [...prevData];
            console.log(candleData, 'real')
            // console.log({...candleData,
            //   time:newData[newData.length - 1].time,
            //   high:newData[newData.length - 1].high,
            //   low:newData[newData.length - 1].low,
            //   open:newData[newData.length - 1].open,
            // },'candleData')

            // candlestickSeriesRef.current?.update({...candleData,
            //   time:newData[newData.length - 1].time,
            //   high:newData[newData.length - 1].high,
            //   low:newData[newData.length - 1].low,
            //   open:newData[newData.length - 1].open,
            // });

            const timeDiff = newData.length > 0 && (candleData.time - newData[newData.length - 1].time) > timeframe * 60;

            console.log(timeDiff, 'timediff')

            if (timeDiff || newData.length === 0) {
              candlestickSeriesRef.current?.update(candleData);
              newData.push(candleData)
              //  if(newData.length > 0){
              //   newData[newData.length - 1]=candleData;
              //  }else{
              //   newData.push(candleData)
              //  }

            } else {
              candlestickSeriesRef.current?.update({
                ...candleData,
                time: newData[newData.length - 1].time,
                high: candleData.close > newData[newData.length - 1].high ? candleData.close : newData[newData.length - 1].high,
                low: candleData.close < newData[newData.length - 1].low ? candleData.close : newData[newData.length - 1].low,
                open: newData[newData.length - 1].open,
              })

              newData[newData.length - 1] = {
                ...candleData,
                time: newData[newData.length - 1].time,
                high: candleData.close > newData[newData.length - 1].high ? candleData.close : newData[newData.length - 1].high,
                low: candleData.close < newData[newData.length - 1].low ? candleData.close : newData[newData.length - 1].low,
                open: newData[newData.length - 1].open,
              }

              //   newData.push({...candleData,
              //   time:newData[newData.length - 1].time,
              //   high:newData[newData.length - 1].high,
              //   low:newData[newData.length - 1].low,
              //   open:newData[newData.length - 1].open,
              // });
            }

            if (newData.length > 365) {
              newData.shift();
            }

            updateIndicators(newData);

            return newData;
          });
        }
      };

      ws.onerror = (error) => {
        console.log('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed. Attempting to reconnect...');
        // setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (wsRef.current) {
        wsRef.current.close();
      }
      chart.remove();
    };
  }, [symbol, timeframe]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  return (
    <div className="w-full bg-white p-4  rounded-lg   ">

      <div className="flex justify-between align-middle items-center my-5">
        <div><h2 class="text-xl font-bold text-gray-800">{symbol} – Underlying Stock</h2><p class="text-gray-600 mt-1 text-[14px]">Timeframe: {timeframe} minute</p></div>
        <div className=" flex flex-row gap-4 border-b-1 border-[#757575] ">
          {
            time.map((item) => (
              <div onClick={() => handleTimeframeChange(item)} className='p-3 hover:bg-gray-100 rounded-lg transition-colors bg-[#8192aa29] cursor-pointer'>
                {item}m
              </div>
            ))
          }
        </div>
      </div>

      <div
        ref={chartContainerRef}
        className="w-full relative"
        style={{ height: '500px' }}
      >
        {/* <div 
          id="chart-tooltip" 
          className="absolute bg-white p-3 w-32 border border-gray-200 shadow-lg rounded-lg hidden"
          style={{ pointerEvents: 'none', zIndex: 100 }}
        /> */}
      </div>
      <RSIChart
        data={historicalData}
        containerRef={chartContainerRef}
        period={14}
        overbought={70}
        oversold={30}
      />
    </div>
  );
};

export default LightweightCandlestick;

