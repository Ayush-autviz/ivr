import { Maximize2, Minimize2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createChart } from 'lightweight-charts';
import LightweightCandlestick from "./LightWeight";
import DeviationChart from "./NetPriceChart";
import useTickerStore from "../store/tickerStore";

export default function SingleChart({
  stock,
  sma,
  setSma,
  smaOptions,
  lma,
  setLma,
  lmaOptions,
  toggleMinimize,
  minimizedCards,
  setMinimizedCards,
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef([]);
  const visibleLogicalRangeRef = useRef(null);
  const {  removeStock } = useTickerStore();

  useEffect(() => {
    if (!chartContainerRef.current || !stock.ivData.length) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    // Create chart if it doesn't exist
    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: '#ffffff' },
          textColor: '#6b7280',
        },
        grid: {
          vertLines: { color: '#e5e7eb' },
          horzLines: { color: '#e5e7eb' },
        },
        rightPriceScale: {
          borderColor: '#e5e7eb',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: '#e5e7eb',
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 1,
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      // Store the visible range when user interacts with the chart
      chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
        if (range) {
          visibleLogicalRangeRef.current = range;
        }
      });

      chartRef.current = chart;
      window.addEventListener('resize', handleResize);
    }

    const chart = chartRef.current;

    // Remove existing series
    seriesRef.current.forEach(series => {
      chart.removeSeries(series);
    });
    seriesRef.current = [];

    // Format data
    const ivData = stock.ivData.map(item => ({
      time: parseInt(item.timestamp),
      value: parseFloat(item.averageIV)
    })).filter(item => !isNaN(item.value));

    // Add main IV area series
    const areaSeries = chart.addAreaSeries({
      lineColor: '#2563eb',
      topColor: '#2563eb20',
      bottomColor: '#2563eb05',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });
    areaSeries.setData(ivData);
    seriesRef.current.push(areaSeries);

    // Add SMA if selected
    if (sma !== 'None') {
      const smaData = stock.ivData.map(item => ({
        time: parseInt(item.timestamp),
        value: parseFloat(item[`MA${sma}`])
      })).filter(item => !isNaN(item.value));

      const smaSeries = chart.addLineSeries({
        color: '#22c55e',
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
      smaSeries.setData(smaData);
      seriesRef.current.push(smaSeries);
    }

    // Add LMA if selected
    if (lma !== 'None') {
      const lmaData = stock.ivData.map(item => ({
        time: parseInt(item.timestamp),
        value: parseFloat(item[`MA${lma}`])
      })).filter(item => !isNaN(item.value));

      const lmaSeries = chart.addLineSeries({
        color: '#ef4444',
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
      lmaSeries.setData(lmaData);
      seriesRef.current.push(lmaSeries);
    }

    // Restore previous visible range if exists
    if (visibleLogicalRangeRef.current) {
      chart.timeScale().setVisibleLogicalRange(visibleLogicalRangeRef.current);
    } else {
      // Only scroll to the latest data on initial load
      chart.timeScale().scrollToPosition(0, true);
    }

    // Format tooltip
    chart.subscribeCrosshairMove(param => {
      if (!param.time || !param.point) return;

      const ivPoint = param.seriesData.get(seriesRef.current[0]); // Area series is always first
      if (!ivPoint) return;

      const tooltipEl = document.getElementById('chart-tooltip');
      if (!tooltipEl) return;

      const time = new Date(param.time * 1000).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).toLowerCase();

      const smaValue = seriesRef.current[1] ? param.seriesData.get(seriesRef.current[1])?.value : null;
      const lmaValue = seriesRef.current[2] ? param.seriesData.get(seriesRef.current[2])?.value : null;

      tooltipEl.style.display = 'block';
      tooltipEl.style.left = `${param.point.x}px`;
      tooltipEl.style.top = `${param.point.y}px`;
      tooltipEl.innerHTML = `
        <p class="text-sm text-gray-600 mb-1">${time}</p>
        <p class="text-sm font-semibold">IV: ${ivPoint.value.toFixed(2)}%</p>
        ${sma !== 'None' && smaValue ? `<p class="text-sm font-semibold" style="color: #22c55e">SMA${sma}: ${smaValue.toFixed(2)}%</p>` : ''}
        ${lma !== 'None' && lmaValue ? `<p class="text-sm font-semibold" style="color: #ef4444">LMA${lma}: ${lmaValue.toFixed(2)}%</p>` : ''}
      `;
    });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [stock.ivData, sma, lma]);

  // Component JSX remains the same...
  return (
    <div className="w-[90%] mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div key={stock.symbol} className="mb-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {stock.symbol} - Average Implied Volatility
            </h2>
            <p className="text-gray-600 mt-1 text-[14px]">
              Tracking: {stock.tracking}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[250px]">
                <label className="block text-[12px] font-medium text-gray-700 mb-1">
                  Short-term Moving Average
                </label>
                <select
                  value={sma}
                  onChange={(e) => setSma(e.target.value)}
                  className="block w-full text-[16px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {smaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "None" ? "No SMA" : `${option} periods`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[250px]">
                <label className="block text-[12px] font-medium text-gray-700 mb-1">
                  Long-term Moving Average
                </label>
                <select
                  value={lma}
                  onChange={(e) => setLma(e.target.value)}
                  className="block w-full text-[16px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {lmaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "None" ? "No LMA" : `${option} periods`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => toggleMinimize(stock.symbol)}
              className="p-3.5 hover:bg-gray-100 rounded-lg transition-colors bg-[#8192aa29]"
            >
              {minimizedCards[stock.symbol] ? (
                <Maximize2 className="w-4 h-4 text-gray-600" />
              ) : (
                <Minimize2 className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => removeStock(stock.symbol)}
              className="p-3.5 hover:bg-gray-100 rounded-lg transition-colors bg-[#8192aa29]"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className={`${minimizedCards[stock.symbol] ? "hidden" : "block"}`}>
          <div className="relative">
            <div ref={chartContainerRef} className="h-[400px]" />
            <div
              id="chart-tooltip"
              className="absolute bg-white p-3 border border-gray-200 shadow-lg rounded-lg hidden"
              style={{ pointerEvents: 'none', zIndex: 100 }}
            />
          </div>
          <LightweightCandlestick symbol={stock.symbol} />
          {/* <div>
            <h2 className="text-xl font-bold text-gray-800 mt-6 ">DeviationChart</h2>
            <div className="grid grid-cols-2 gap-4">

              {
                [12, 13, 15, 16].map((item, index) => {
                  return <DeviationChart stock={stock} index={index} />
                })
              }
            </div>
          </div> */}


        </div>
      </div>
    </div>
  );
}