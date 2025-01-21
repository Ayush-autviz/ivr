import React, { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
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
  const [selectedTimeframe, setSelectedTimeframe] = useState("1min");
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const dashedLineRef = useRef(null);
  const timeRangeRef = useRef({
    visibleRange: null,
    logicalRange: null,
    scrollPosition: null,
    firstRender: true,
    lastPos: null,
  });

  const track = stock.tracking.split(",");

  const processChartData = (stock, selectedTimeframe) => {
    return stock?.ivData
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
      .filter((item) => !isNaN(item?.time))
      .reduce((acc, curr) => {
        const existingIndex = acc.findIndex(
          (point) => point.time === curr.time
        );
        if (existingIndex !== -1) {
          acc[existingIndex] = curr;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartData = processChartData(stock, selectedTimeframe);

    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: "#ffffff" },
          textColor: "#333",
          lineWidth: 2,
        },
        grid: {
          vertLines: { color: "#f0f0f0" },
          horzLines: { color: "#f0f0f0" },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          autoScale: false,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
          entireTextOnly: true,
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 5,
          barSpacing: 12,
          fixLeftEdge: false,
          fixRightEdge: false,
          minBarSpacing: 6,
        },
      });

      chartRef.current = chart;

      seriesRef.current = chart.addBaselineSeries({
        baseValue: { type: "price", price: 0 },
        topLineColor: "#22c55e",
        topFillColor1: "rgba(34, 197, 94, 0.2)",
        topFillColor2: "rgba(34, 197, 94, 0.05)",
        bottomLineColor: "#ef4444",
        bottomFillColor1: "rgba(239, 68, 68, 0.2)",
        bottomFillColor2: "rgba(239, 68, 68, 0.05)",
        lineWidth: 2,
        lastValueVisible: true,
      });

      dashedLineRef.current = chart.addLineSeries({
        color: "#666",
        lineStyle: 1,
        lineWidth: 1,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const timeScale = chart.timeScale();

      // Track time range and position changes
      timeScale.subscribeVisibleTimeRangeChange((visibleRange) => {
        if (visibleRange) {
          const currentPos = timeScale.scrollPosition();
          if (currentPos !== undefined) {
            timeRangeRef.current.lastPos = currentPos;
          }

          timeRangeRef.current = {
            ...timeRangeRef.current,
            visibleRange,
            logicalRange: timeScale.getVisibleLogicalRange(),
          };
        }
      });
    }

    const updateChartData = () => {
      if (!seriesRef.current || !dashedLineRef.current) return;

      const timeScale = chartRef.current.timeScale();
      const currentPos = timeScale.scrollPosition();

      // Save the current position before updating data
      if (currentPos !== undefined && !timeRangeRef.current.firstRender) {
        timeRangeRef.current.lastPos = currentPos;
      }

      const zeroLineData = chartData?.map((item) => ({
        time: item.time,
        value: 0,
      }));

      // Update the data
      seriesRef.current.setData(chartData || []);
      dashedLineRef.current.setData(zeroLineData || []);

      // Restore position after data update
      requestAnimationFrame(() => {
        if (timeRangeRef.current.firstRender) {
          // First render - scroll to recent data
          timeScale.scrollToRealTime();
          timeRangeRef.current.firstRender = false;
        } else if (timeRangeRef.current.lastPos !== null) {
          // Subsequent updates - maintain position
          timeScale.scrollToPosition(timeRangeRef.current.lastPos, false);
        }
      });
    };

    updateChartData();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });

        // Restore position after resize
        if (timeRangeRef.current.lastPos !== null) {
          chartRef.current
            .timeScale()
            .scrollToPosition(timeRangeRef.current.lastPos, false);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current && !chartContainerRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
        dashedLineRef.current = null;
        timeRangeRef.current = {
          visibleRange: null,
          logicalRange: null,
          scrollPosition: null,
          firstRender: true,
          lastPos: null,
        };
      }
    };
  }, [stock, selectedTimeframe]);

  return (
    <div className="w-full mx-auto mt-3 bg-white rounded-lg shadow-sm border border-grey-50 p-4">
      <div className="flex justify-between items-center pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {stock.symbol}-Net Price Change
          </h2>
          <p className="text-gray-600 mt-1 text-[14px]">
            Timeframe: {selectedTimeframe}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
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
