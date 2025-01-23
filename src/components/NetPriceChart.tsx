import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import useTickerStore from "../store/tickerStore";
import { Maximize2, Minimize2 } from "lucide-react";

const timeframes = [
  { label: "1m", value: "1min" },
  { label: "5m", value: "5min" },
  { label: "10m", value: "10min" },
  { label: "15m", value: "15min" },
  { label: "30m", value: "30min" },
];

const DeviationChart = ({ stock, index }) => {
  const [isColapsed, setIsColapsed] = useState(false);
  // const { stocks } = useTickerStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1min");
  const chartContainerRef = useRef(null);
  const visibleLogicalRangeRef = useRef(null);
  const chartRef = useRef(null);

  const track = stock.tracking.split(",");
  console.log(track, "track array");

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart =
        chartRef.current ||
        createChart(chartContainerRef.current, {
          layout: {
            background: { color: "#ffffff" },
            textColor: "#333",
          },
          width: chartContainerRef.current.clientWidth,
          height: 400,
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
        });

      // Update chart reference
      if (!chartRef.current) chartRef.current = chart;

      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) visibleLogicalRangeRef.current = range;
      });

      const series = chart.addBaselineSeries({
        baseValue: { type: "price", price: 0 },
        topLineColor: "#22c55e",
        topFillColor1: "rgba(34, 197, 94, 0.2)",
        topFillColor2: "rgba(34, 197, 94, 0.05)",
        bottomLineColor: "#ef4444",
        bottomFillColor1: "rgba(239, 68, 68, 0.2)",
        bottomFillColor2: "rgba(239, 68, 68, 0.05)",
        lineWidth: 2,
      });

      const chartData = stock?.ivData
        ?.map((item) => {
          const timeframeData = item.timeframeData?.[selectedTimeframe];
          if (timeframeData) {
            const values = timeframeData
              .map((dataPoint) => parseFloat(dataPoint.value))
              .filter((value) => !isNaN(value));
            const average =
              values.reduce((sum, value) => sum + value, 0) / values.length;
            return {
              time:
                parseInt(timeframeData?.[0]?.time) -
                new Date().getTimezoneOffset() * 60,
              value: average,
            };
          }
          return null;
        })
        .filter((item) => item && !isNaN(item.time));

      series.setData(chartData || []);

      // Restore visible range only if the user has moved the chart
      if (visibleLogicalRangeRef.current) {
        chart
          .timeScale()
          .setVisibleLogicalRange(visibleLogicalRangeRef.current);
      }

      // Resize handling
      const handleResize = () => {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.removeSeries(series);
      };
    }
  }, [stock, selectedTimeframe]);

  return (
    <div className="w-full  mx-auto mt-3 bg-white rounded-lg shadow-sm border border-grey-50 p-4">
      <div className="flex justify-between items-center pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {stock.symbol}-Net Price Change
          </h2>
          <p className="text-gray-600 mt-1 text-[14px]">
            Timeframe: {selectedTimeframe}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap ">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              className={`
             p-3 hover:bg-gray-100 rounded-lg transition-colors bg-[#8192aa29] cursor-pointer
              ${
                selectedTimeframe === timeframe.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
              transition-colors
            `}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsColapsed((s) => !s)}
          className="p-3.5 hover:bg-gray-100 rounded-lg transition-colors bg-[#8192aa29]"
        >
          {isColapsed ? (
            <Maximize2 className="w-4 h-4 text-gray-600" />
          ) : (
            <Minimize2 className="w-4 h-4 text-gray-600" />
          )}

          {/* */}
        </button>
      </div>
      <div
        ref={chartContainerRef}
        className={`w-full ${isColapsed ? "hidden" : "block"}`}
      />
    </div>
  );
};

export default DeviationChart;
