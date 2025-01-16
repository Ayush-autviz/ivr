import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import useTickerStore from "../store/tickerStore";
import { X, Minimize2, Maximize2 } from "lucide-react";
import SingleChart from "./SingleChart";
import LightweightCandlestick from "./LightWeight";
import usePersistStore from "../store/persistStore";
const OptionsIVChart = () => {
  // const { error, setError,  } = useTickerStore();
  const { stocks, fetchStocks, error, setError, loading } = usePersistStore();
  const [minimizedCards, setMinimizedCards] = useState({});
  const [sma, setSma] = useState("None");
  const [lma, setLma] = useState("None");

  const smaOptions = ["None", "3", "6", "12", "36", "60"];
  const lmaOptions = ["None", "180", "360", "540", "720", "1440"];

  useEffect(() => {
    fetchStocks();
  }, []);

  const toggleMinimize = (symbol) => {
    setMinimizedCards((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  // if (stocks.length > 0) {
  //   return (
  //     <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-100">
  //       Please add stocks to continue
  //     </div>
  //   );
  // }

  if (stocks.length < 1)
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-100">
        Please add stocks to continue
      </div>
    );

  return (
    <div className="flex flex-col w-full mx-10 gap-10">
      {loading ? (
        <>
          <h1>Loading</h1>
        </>
      ) : (
        <>
          {stocks.map((stock) => (
            <div className="flex flex-col">
              <SingleChart
                stock={stock}
                sma={sma}
                setSma={setSma}
                smaOptions={smaOptions}
                lma={lma}
                setLma={setLma}
                lmaOptions={lmaOptions}
                toggleMinimize={toggleMinimize}
                minimizedCards={minimizedCards}
                setMinimizedCards={setMinimizedCards}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default OptionsIVChart;
