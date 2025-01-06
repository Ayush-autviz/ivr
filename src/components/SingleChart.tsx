import { Maximize2, Minimize2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Area, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

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

  useEffect(() => {
    if (chartContainerRef.current && stock.ivData.length > 0) {
      // Scroll to the rightmost position
      chartContainerRef.current.scrollLeft =
        chartContainerRef.current.scrollWidth;
    }
  }, [stock.ivData]);
  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date
      .toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    console.log(`MA${sma}`, "payload");
    console.log(payload[0]?.payload[`MA(${sma})`], "ma5");
    if (active && payload && payload.length) {
      const date = new Date(label * 1000);
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="text-sm text-gray-600 mb-1">
            {date
              .toLocaleString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
              .toLowerCase()}
          </p>
          {/* {payload.payload.map((entry, index) => ( */}
          <p
            // key={index}
            className="text-sm font-semibold"
            style={{ color: "#22c55e" }}
          >
            {sma !== "None" && (
              <>
                SMA{sma} {payload[0]?.payload[`MA${sma}`]}
              </>
            )}
          </p>
          <p
            // key={index}
            className="text-sm font-semibold"
            style={{ color: "#ef4444" }}
          >
            {lma !== "None" && (
              <>
                LMA{lma} {payload[0]?.payload[`MA${lma}`]}
              </>
            )}
          </p>

          {/* ))} */}
        </div>
      );
    }
    return null;
  };
  return (
    <div className="w-[90%]  mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div key={stock.symbol} className="mb-10">
        <div className="flex justify-between items-center mb-10 ">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {stock.symbol} - Average Implied Volatility
            </h2>
            <p className="text-gray-600 mt-1 text-[14px]">
              Tracking: {stock.tracking}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <div className="flex items-center gap-4 mb-6 ">
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
          {/* <div className="flex gap-4 mb-6 ">
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short-term Moving Average
            </label>
            <select
              value={sma}
              onChange={(e) => setSma(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {smaOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "None" ? "No SMA" : `${option} periods`}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Long-term Moving Average
            </label>
            <select
              value={lma}
              onChange={(e) => setLma(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {lmaOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "None" ? "No LMA" : `${option} periods`}
                </option>
              ))}
            </select>
          </div>
        </div> */}

          <div
            ref={chartContainerRef}
            onScroll={(e) => {
              let wrapper = document.querySelector(`.recharts-surface`);
              let graphWrapper = document.querySelector(`.graph-wrapper`);

              const allAxis = document.querySelectorAll(`.recharts-yAxis`);

              let xAxis = document.querySelector(`.recharts-xAxis`);

              const xAxisHeight = xAxis.getBoundingClientRect().height;

              allAxis?.forEach((axis) => {
                const orientation = axis
                  .querySelector(`.recharts-cartesian-axis-tick-line`)
                  ?.getAttribute("orientation");

                //Adding a rect
                const rect = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "rect"
                );
                const yAxisheight = axis.getBoundingClientRect().height;
                const yAxisWidth = axis.getBoundingClientRect().width;

                rect.setAttribute("x", "0");
                rect.setAttribute("y", "0");
                rect.setAttribute("width", yAxisWidth);
                rect.setAttribute("height", yAxisheight + xAxisHeight);
                rect.setAttribute("fill", "white");
                rect.setAttribute("class", `y-axis-rect-${orientation}`);

                axis.insertBefore(rect, axis.firstChild);

                const position =
                  orientation === "left"
                    ? e.target.scrollLeft
                    : e.target.scrollLeft -
                      wrapper?.clientWidth +
                      graphWrapper?.clientWidth;

                axis.style = "transform: translateX(" + position + "px);";
              });
            }}
            className="h-[400px] scrollbar graph-wrapper app-container"
            id="style-3"
          >
            {/* <ResponsiveContainer height="100%"> */}
            <ComposedChart
              height={400}
              width={
                stock.ivData.length * 100 < 100
                  ? 100
                  : stock.ivData.length * 100
              }
              data={stock.ivData}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="#6b7280"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="averageIV"
                stroke="#2563eb"
                fill="#2563eb20"
                strokeWidth={2}
                name="IV"
                connectNulls
              />

              {sma !== "None" && (
                <Line
                  type="monotone"
                  dataKey={`MA${sma}`}
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name={`SMA(${sma})`}
                  connectNulls
                />
              )}
              {lma !== "None" && (
                <Line
                  type="monotone"
                  dataKey={`MA${lma}`}
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name={`LMA(${lma})`}
                  connectNulls
                />
              )}
              <YAxis
                stroke="#6b7280"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `${value}%`}
                domain={["auto", "auto"]}
              />
            </ComposedChart>
            {/* </ResponsiveContainer> */}
          </div>
        </div>
      </div>
    </div>
  );
}
