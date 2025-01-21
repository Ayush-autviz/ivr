import { Maximize2, Minimize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import LightweightCandlestick from "./LightWeight";
import DeviationChart from "./NetPriceChart";
import OptionChainTable from "./OptionData";
import usePersistStore from "../store/persistStore";
const timeframes = [
  { label: "1m", value: "1min" },
  { label: "5m", value: "5min" },
  { label: "10m", value: "10min" },
  { label: "15m", value: "15min" },
  { label: "30m", value: "30min" },
];
export default function mSingleChart({
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
  const isUpdatingRef = useRef(false);
  const visibleLogicalRangeRef = useRef(null);
  const { removeStock, zoom, setZoom, globalTimeFrame, setGlobalTimeFrame } =
    usePersistStore();

  console.log(globalTimeFrame, "global");
  // const [selectedTimeframe, setSelectedTimeframe] = useState("1min");
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
          background: { color: "#ffffff" },
          textColor: "#6b7280",
        },
        grid: {
          vertLines: { color: "#e5e7eb" },
          horzLines: { color: "#e5e7eb" },
        },
        rightPriceScale: {
          borderColor: "#e5e7eb",
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: "#e5e7eb",
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
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) {
          visibleLogicalRangeRef.current = range;
        }
      });

      chartRef.current = chart;
      window.addEventListener("resize", handleResize);
    }

    const chart = chartRef.current;

    // Remove existing series
    seriesRef.current.forEach((series) => {
      chart.removeSeries(series);
    });
    seriesRef.current = [];

    // Format data
    const ivData = stock.ivData
      .map((item) => ({
        time: parseInt(item.timestamp) - new Date().getTimezoneOffset() * 60, // Adjust to UTC
        value: parseFloat(item?.timeframeDataIV[globalTimeFrame]?.averageIV),
      }))
      .filter((item) => !isNaN(item.value));

    // Add main IV area series
    const areaSeries = chart.addAreaSeries({
      lineColor: "#2563eb",
      topColor: "#2563eb20",
      bottomColor: "#2563eb05",
      lineWidth: 2,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    });
    areaSeries.setData(ivData);
    seriesRef.current.push(areaSeries);

    // Add SMA if selected
    if (sma !== "None") {
      const smaData = stock.ivData
        .map((item) => ({
          time: parseInt(item.timestamp) - new Date().getTimezoneOffset() * 60, // Adjust to UTC
          value: parseFloat(item[`MA${sma}`]),
        }))
        .filter((item) => !isNaN(item.value));

      const smaSeries = chart.addLineSeries({
        color: "#22c55e",
        lineWidth: 2,
        priceFormat: {
          type: "price",
          precision: 2,
          minMove: 0.01,
        },
      });
      smaSeries.setData(smaData);
      seriesRef.current.push(smaSeries);
    }

    // Add LMA if selected
    if (lma !== "None") {
      const lmaData = stock.ivData
        .map((item) => ({
          time: parseInt(item.timestamp) - new Date().getTimezoneOffset() * 60, // Adjust to UTC
          value: parseFloat(item[`MA${lma}`]),
        }))
        .filter((item) => !isNaN(item.value));

      const lmaSeries = chart.addLineSeries({
        color: "#ef4444",
        lineWidth: 2,
        priceFormat: {
          type: "price",
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

    // new change
    // chart.timeScale().subscribeVisibleTimeRangeChange((newTimeRange) => {
    //   if (
    //     newTimeRange &&
    //     !isUpdatingRef.current &&
    //     JSON.stringify(newTimeRange) !== JSON.stringify(zoom)
    //   ) {
    //     try {
    //       isUpdatingRef.current = true;
    //       // Ensure we're storing timestamps in seconds
    //       const formattedRange = {
    //         from:
    //           typeof newTimeRange.from === "number"
    //             ? newTimeRange.from
    //             : Math.floor(new Date(newTimeRange.from).getTime() / 1000),
    //         to:
    //           typeof newTimeRange.to === "number"
    //             ? newTimeRange.to
    //             : Math.floor(new Date(newTimeRange.to).getTime() / 1000),
    //       };

    //       setZoom(formattedRange);

    //       setTimeout(() => {
    //         isUpdatingRef.current = false;
    //       }, 0);
    //     } catch (error) {
    //       console.error("Error in zoom subscription:", error);
    //       isUpdatingRef.current = false;
    //     }
    //   }
    // });

    // new change

    // Format tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) return;

      const ivPoint = param.seriesData.get(seriesRef.current[0]); // Area series is always first
      if (!ivPoint) return;

      const tooltipEl = document.getElementById("chart-tooltip");
      if (!tooltipEl) return;

      // Get the user's local time zone
      const userTimeZone = Intl.DateTimeFormat()?.resolvedOptions().timeZone;

      // Convert the time to the user's local time zone
      const time = new Date(
        (param.time + new Date().getTimezoneOffset() * 60) * 1000
      )
        .toLocaleString("en-US", {
          timeZone: userTimeZone, // Use the browser's local time zone
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase();

      const smaValue = seriesRef.current[1]
        ? param.seriesData.get(seriesRef.current[1])?.value
        : null;
      const lmaValue = seriesRef.current[2]
        ? param.seriesData.get(seriesRef.current[2])?.value
        : null;

      tooltipEl.style.display = "block";
      tooltipEl.style.left = `${param.point.x}px`;
      tooltipEl.style.top = `${param.point.y}px`;
      tooltipEl.innerHTML = `
        <p class="text-sm text-gray-600 mb-1">${time}</p>
        <p class="text-sm font-semibold">IV: ${ivPoint.value.toFixed(2)}%</p>
        ${
          sma !== "None" && smaValue
            ? `<p class="text-sm font-semibold" style="color: #22c55e">SMA: ${smaValue.toFixed(
                2
              )}%</p>`
            : ""
        }
        ${
          lma !== "None" && lmaValue
            ? `<p class="text-sm font-semibold" style="color: #ef4444">LMA: ${lmaValue.toFixed(
                2
              )}%</p>`
            : ""
        }
      `;
    });

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [stock.ivData, sma, lma, globalTimeFrame]);
  // useEffect(() => {
  //   if (chartRef.current && zoom) {
  //     try {
  //       // Convert timestamps to proper format if needed
  //       const formattedZoom = {
  //         from:
  //           typeof zoom.from === "number"
  //             ? zoom.from
  //             : Math.floor(new Date(zoom.from).getTime() / 1000),
  //         to:
  //           typeof zoom.to === "number"
  //             ? zoom.to
  //             : Math.floor(new Date(zoom.to).getTime() / 1000),
  //       };

  //       // Log the values to debug
  //       console.log("Setting zoom range:", formattedZoom);

  //       chartRef.current.timeScale().setVisibleRange(formattedZoom);
  //     } catch (error) {
  //       console.error("Error setting zoom range:", error, zoom);
  //     }
  //   }
  // }, [zoom]);
  return (
    <div className="w-[90%] mx-auto p-6 bg-white mb-4 rounded-xl shadow-lg">
      <div key={stock.symbol} className="">
        {/* <div className="flex justify-between items-center mb-10">
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
        </div> */}

        <div
          className={`flex flex-row gap-2 justify-between items-center w-full  p-4 ${
            minimizedCards[stock.symbol] ? "" : "mb-4"
          } `}
        >
          <h2 className="text-xl font-bold text-gray-800">{stock.symbol}</h2>
          <div className="flex gap-2">
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
          <div className="flex flex-col  rounded-lg  shadow-sm border border-grey-50 p-4  w-full">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {stock.symbol} - Average Implied Volatility
                </h2>
                <p className="text-gray-600 mt-1 text-[14px]">
                  Tracking: {stock.tracking}
                </p>
              </div>

              <div className="flex gap-2 items-center flex-wrap ">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe.value}
                    onClick={() => setGlobalTimeFrame(timeframe.value)}
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
              <div className="flex items-center gap-2 ">
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
                      {smaOptions.map((option) => {
                        if (option <= 6) {
                          return (
                            <option key={option} value={option}>
                              {option === "None"
                                ? "No SMA"
                                : `${option * 5} seconds`}
                            </option>
                          );
                        } else {
                          return (
                            <option key={option} value={option}>
                              {option === "None"
                                ? "No SMA"
                                : `${(option * 5) / 60} minutes`}
                            </option>
                          );
                        }
                      })}
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
                      {lmaOptions.map((option) => {
                        if (option <= 540) {
                          return (
                            <option key={option} value={option}>
                              {option === "None"
                                ? "No LMA"
                                : `${(option * 5) / 60} minutes`}
                            </option>
                          );
                        } else {
                          return (
                            <option key={option} value={option}>
                              {option === "None"
                                ? "No LMA"
                                : `${(option * 5) / 3600} hours`}
                            </option>
                          );
                        }
                      })}
                    </select>
                  </div>
                </div>
                {/*
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
             */}
              </div>
            </div>
            <div className="relative ">
              <div ref={chartContainerRef} className="h-[400px]" />
              <div
                id="chart-tooltip"
                className="absolute bg-white p-3 border border-gray-200 shadow-lg rounded-lg  hidden"
                style={{ pointerEvents: "none", zIndex: 100 }}
              />
            </div>
          </div>
          <DeviationChart stock={stock} />
          <OptionChainTable stock={stock} />

          <LightweightCandlestick symbol={stock.symbol} />
        </div>
      </div>
    </div>
  );
}
