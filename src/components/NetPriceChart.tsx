import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import useTickerStore from "../store/tickerStore";

const timeframes = [
  { label: "1m", value: "1min" },
  { label: "5m", value: "5min" },
  { label: "10m", value: "10min" },
  { label: "15m", value: "15min" },
  { label: "30m", value: "30min" },
];

const DeviationChart = ({ stock, index }) => {
  // const { stocks } = useTickerStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1min");
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  const track = stock.tracking.split(",")
  console.log(track, 'track array')

  useEffect(() => {
    if (chartContainerRef.current) {
      // Get the data first to calculate the range
      const chartData = stock?.ivData?.map(item => {
        const timeframeData = item.timeframeData?.[selectedTimeframe];
        return {
          time: parseInt(timeframeData?.[index]?.time),
          value: timeframeData ? parseFloat(timeframeData[index].value) : null,
        };
      }).filter(item => item.value !== null && !isNaN(item.value));

      // Calculate the maximum absolute value
      // const maxAbsValue = Math.max(
      //   ...chartData?.map(item => Math.abs(item.value))
      // );

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: "#ffffff" },
          textColor: "#333",
          lineWidth:2,
        },
        grid: {
          vertLines: { color: "#f0f0f0" },
          horzLines: { color: "#f0f0f0" },

        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        lineWidth:1,
        lineColor:"yellow",
        rightPriceScale: {
          autoScale: false,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
          entireTextOnly: true,
          // mode: 2,
          // minValue: -maxAbsValue,
          // maxValue: maxAbsValue
        },
      });

      // Add the baseline series for the deviation data
      const zeroLine = chart.addBaselineSeries({
        baseValue: { type: "price", price: 0 },
        topLineColor: "#22c55e",
        topFillColor1: "rgba(34, 197, 94, 0.2)",
        topFillColor2: "rgba(34, 197, 94, 0.05)",
        bottomLineColor: "#ef4444",
        bottomFillColor1: "rgba(239, 68, 68, 0.2)",
        bottomFillColor2: "rgba(239, 68, 68, 0.05)",
        lineWidth: 2,
      });

      // Add dashed zero line
      const dashedZeroLine = chart.addLineSeries({
        color: '#666',
        lineStyle: 1, // 1 represents dashed line
        lineWidth: 1,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      // Create zero line data points
      const zeroLineData = chartData?.map(item => ({
        time: item.time,
        value: 0
      }));

      // Set the data
      zeroLine.setData(chartData || []);
      dashedZeroLine.setData(zeroLineData || []);

      chartRef.current = chart;

      // Handle resize
      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    }
  }, [stock, selectedTimeframe]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-3 bg-white rounded-lg shadow-sm border border-grey-50 p-4">
      <div className="flex justify-between items-center pb-5">
        <div><h2 className="text-xl font-bold text-gray-800">Tracking</h2>
          <p className="text-gray-600 text-[14px]">{track[index]}</p></div>
        <div className="flex gap-2 items-center flex-wrap ">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              className={`
             p-3 hover:bg-gray-100 rounded-lg transition-colors bg-[#8192aa29] cursor-pointer
              ${selectedTimeframe === timeframe.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              transition-colors
            `}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};

export default DeviationChart;