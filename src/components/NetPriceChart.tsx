import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import useTickerStore from "../store/tickerStore";
import { Maximize2, Minimize2 } from "lucide-react";
import usePersistStore from "../store/persistStore";

const timeframes = [
  { label: "1m", value: "1min" },
  { label: "5m", value: "5min" },
  { label: "10m", value: "10min" },
  { label: "15m", value: "15min" },
  { label: "30m", value: "30min" },
];

const DeviationChart = ({ stock, index }) => {
  const [isColapsed, setIsColapsed] = useState(false);
  const { zoom, setZoom, globalTimeFrame, setGlobalTimeFrame } =
    usePersistStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1min");
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const track = stock.tracking.split(",");

  useEffect(() => {
    if (chartContainerRef.current) {
      // Get the data first to calculate the range

      const chartData = stock?.ivData

        ?.map((item) => {
          const timeframeData = item.timeframeData?.[selectedTimeframe];
          if (timeframeData) {
            // Calculate the average of all values in the timeframeData
            const values = timeframeData
              .map((dataPoint) => {
                return parseFloat(dataPoint.value);
              })
              .filter((value) => !isNaN(value));

            const total = values.reduce((sum, value) => sum + value, 0);

            const average = total / values.length;

            return {
              time:
                parseInt(timeframeData?.[0]?.time) -
                new Date().getTimezoneOffset() * 60, // Use the time of the first entry
              value: average, // Store the average as the value
            };
          }
          return null;
        })
        .filter((item) => !isNaN(item?.time)) // Filter out any null entries
        .reduce((acc, curr) => {
          // Check if the current time already exists in the accumulator
          const existingIndex = acc.findIndex(
            (point) => point.time === curr.time
          );
          if (existingIndex !== -1) {
            // Replace the existing point with the current one
            acc[existingIndex] = curr;
          } else {
            // Add the current point if it's not a duplicate
            acc.push(curr);
          }
          return acc;
        }, []);

      // Calculate the maximum absolute value
      // const maxAbsValue = Math.max(
      //   ...chartData?.map(item => Math.abs(item.value))
      // );

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
        lineWidth: 1,
        lineColor: "yellow",
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
        timeScale: {
          timeVisible: true, // Enables the display of time
          secondsVisible: false, // Show seconds as well
        },
        // localization: {
        //   timeFormatter: (timestamp) => {
        //     const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        //     return date.toLocaleString([], {
        //       timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Automatically detects browser time zone
        //       hour: "2-digit",
        //       minute: "2-digit",
        //       second: "2-digit", // Optional: Include seconds
        //       day: "2-digit",
        //       month: "2-digit",
        //       year: "numeric",
        //     });
        //   },
        // },
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
        color: "#666",
        lineStyle: 1, // 1 represents dashed line
        lineWidth: 1,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      // Create zero line data points
      const zeroLineData = chartData?.map((item) => ({
        time: item.time,
        value: 0,
      }));

      // Set the data
      zeroLine.setData(chartData || []);
      dashedZeroLine.setData(zeroLineData || []);

      chartRef.current = chart;

      // chart.timeScale().subscribeVisibleTimeRangeChange((newTimeRange) => {
      //   if (
      //     newTimeRange &&
      //     !isUpdatingRef.current &&
      //     JSON.stringify(newTimeRange) !== JSON.stringify(zoom)
      //   ) {
      //     isUpdatingRef.current = true;
      //     setZoom(newTimeRange); // Set the new time range, not the current zoom
      //     setTimeout(() => {
      //       isUpdatingRef.current = false;
      //     }, 0);
      //   }
      // });
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

  // useEffect(() => {
  //   if (chartRef.current && zoom && !isUpdatingRef.current) {
  //     try {
  //       // Validate that zoom has the required properties
  //       if (zoom.from && zoom.to) {
  //         isUpdatingRef.current = true;
  //         chartRef.current.timeScale().setVisibleRange({
  //           from: zoom.from,
  //           to: zoom.to,
  //         });
  //         setTimeout(() => {
  //           isUpdatingRef.current = false;
  //         }, 0);
  //       }
  //     } catch (error) {
  //       console.error("Error setting chart zoom:", error);
  //       isUpdatingRef.current = false;
  //     }
  //   }
  // }, [zoom]);
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
              onClick={() => {
                setSelectedTimeframe(timeframe.value);
                setGlobalTimeFrame(timeframe.value);
              }}
              className={`
             p-3 hover:bg-gray-100 rounded-lg transition-colors bg-[#8192aa29] cursor-pointer
              ${
                globalTimeFrame === timeframe.value
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
